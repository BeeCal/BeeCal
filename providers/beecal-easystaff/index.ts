import { Area, Course, Curriculum, Lesson, Teaching, TimetableProvider } from "beecal-common";

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
        const values: Object = JSON.parse(parseJs(response).get("anni_accademici_ec"));
        const allKeys = Object.keys(values).map(x => parseInt(x)).sort();
        const mostRecent = allKeys[allKeys.length - 1];
        this.academicYear = values[`${mostRecent}`].valore;
    }

    getAreas(): Promise<Area[]> {
        throw new Error("Method not implemented.");
    }
    getCourses(areaId: string): Promise<Course[]> {
        throw new Error("Method not implemented.");
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