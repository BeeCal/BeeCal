import { Area, Course, Curriculum, Lesson, Teaching, TimetableProvider } from "beecal-common";
import { ESCourse } from "./types";
import { JSParser } from "./jsparser";

export class EasyStaffProvider implements TimetableProvider {
    comboCall: string;
    gridCall: string;
    baseURL: string;
    country: string;
    institutionName: string;
    license = "All Rights Reserved";
    academicYear?: string = undefined;
    areas: Area[] = [];
    courses: ESCourse[] = [];

    constructor(name: string, country: string, baseURL: string, comboCall: string, gridCall: string) {
        this.baseURL = baseURL;
        this.comboCall = comboCall;
        this.gridCall = gridCall;
        this.institutionName = name;
        this.country = country;
    }

    async #setAcademicYear() {
        const response = await fetch(`${this.baseURL}/${this.comboCall}?sw=ec_&aa=1`)
            .then(x => x.text())
            .then(x => new JSParser(x));
        const values: { [index: string]: { valore: string } } = response.get("anni_accademici_ec");
        const allKeys = Object.keys(values).map(x => parseInt(x)).sort();
        const mostRecent = allKeys[allKeys.length - 1];
        this.academicYear = values[`${mostRecent}`].valore;
    }

    async #updateCoursesAndAreas() {
        const response = await fetch(`${this.baseURL}/${this.comboCall}?aa=${this.academicYear}&page=corsi&sw=ec_`)
            .then(x => x.text())
            .then(x => new JSParser(x));

        // Reset
        this.areas = response.get<{ label: string; valore: string; }[]>("elenco_scuole")
            .map((x) => { return { name: x.label, id: x.valore } });
        const existingAreas = new Set(this.areas.map(x => x.id));

        // Fill in data
        this.courses = response.get("elenco_corsi");
        for (const course of this.courses) {
            course.scuola = course.scuola == "" ? "Default" : course.scuola;
            if (!existingAreas.has(course.scuola)) {
                this.areas.push({ id: course.scuola, name: course.scuola });
                existingAreas.add(course.scuola);
            }
        }
    }

    async getAreas(): Promise<Area[]> {
        return this.areas;
    }

    async getCourses(areaId: string): Promise<Course[]> {
        return this.courses
            .filter(x => x.scuola == areaId)
            .map(x => {
                return {
                    duration: new Set(x.elenco_anni.map(x => x.valore.split("|")[1])).size,
                    id: x.valore,
                    name: x.label,
                    type: x.tipo,
                }
            })
    }

    async getCurricula(courseId: string): Promise<Curriculum[]> {
        const course = this.courses.find(x => x.valore == courseId);
        if (course === undefined) {
            throw new Error(`The course ${courseId} was not found.`);
        }

        const getName = (x: string) => {
            const splitted = x.split(" - ");
            if (splitted.length != 2) {
                return x;
            } else {
                return splitted[1];
            }
        }

        const curricula = new Map(course.elenco_anni.map(x => [x.valore.split("|")[0], getName(x.label)]));
        return Array.from(curricula).map(x => { return { id: x[0], name: x[1] } })
    }

    async getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]> {
        const yearId = `${curriculum}|${year}`;
        const course = this.courses.find(x => x.valore == courseId);
        if (course === undefined) {
            throw new Error("Cannot find course " + courseId);
        }
        const yearData = course.elenco_anni.find(x => x.valore == yearId);
        if (yearData === undefined) {
            throw new Error(`Cannot find curriculum ${curriculum} for year ${year}`);
        }
        return yearData.elenco_insegnamenti.map(x => { return { id: x.valore, name: x.label } });
    }
    getLessons(courseId: string, curriculum: string, year: number, teachingIDsFilter?: Set<string>): Promise<Lesson[]> {
        throw new Error("Method not implemented.");
    }
}