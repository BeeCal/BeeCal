import { Area, Course, Curriculum, Lesson, Teaching, TimetableProvider } from "beecal-common";
import { ESCourse } from "./types";

function parseJs(js: string): Map<string, string> {
    const regex = /var\s(?<identifier>\S[^\s]*)\s*=\s*(?<value>.*);/g;
    const result = new Map<string, string>();

    for (const match of js.matchAll(regex)) {
        const identifier = match.groups?.identifier?.trim();
        const value = match.groups?.value;

        if (identifier !== undefined && value !== undefined) {
            result.set(identifier, value);
        }
    }

    return result;
}


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
            .then(x => x.text());
        const values: { [index: string]: { valore: string } } = JSON.parse(parseJs(response).get("anni_accademici_ec") || "{}");
        const allKeys = Object.keys(values).map(x => parseInt(x)).sort();
        const mostRecent = allKeys[allKeys.length - 1];
        this.academicYear = values[`${mostRecent}`].valore;
    }

    async #updateCoursesAndAreas() {
        const response = await fetch(`${this.baseURL}/${this.comboCall}?aa=${this.academicYear}&page=corsi&sw=ec_`)
            .then(x => x.text())
            .then(x => parseJs(x));

        // Reset
        this.areas = JSON.parse(response.get("elenco_scuole") || "[]").map((x: { label: string; valore: string; }) => { return { name: x.label, id: x.valore } });
        const existingAreas = new Set(this.areas.map(x => x.id));

        // Fill in data
        this.courses = JSON.parse(response.get("elenco_corsi") || "[]");
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
                    duration: x.elenco_anni.length,
                    id: x.valore,
                    name: x.label,
                    type: x.tipo,
                }
            })
    }

    getCurricula(courseId: string): Promise<Curriculum[]> {
        throw new Error("Method not implemented.");
    }
    getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]> {
        throw new Error("Method not implemented.");
    }
    getLessons(courseId: string, curriculum: string, year: number, teachingIDsFilter?: Set<string>): Promise<Lesson[]> {
        throw new Error("Method not implemented.");
    }
}