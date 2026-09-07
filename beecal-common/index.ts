import { Task } from "./scheduling";
export { Schedule } from "./scheduling";

export interface TimetableProvider {
    institutionName: string,
    country: string,
    license: string,

    getAreas(): Promise<Area[]>,
    getCourses(areaId: string): Promise<Course[]>,
    getCurricula(courseId: string): Promise<Curriculum[]>,
    getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]>,
    getLessons(courseId: string, curriculum: string, year: number, teachingIDsFilter?: Set<string>): Promise<Lesson[]>,

    /**
     * Guarantees:
     * - every task will be run before initialisation
     * - the tasks will be run in the order they are returned
     */
    getTasks(): Task[],
}

export interface Area {
    name: string,
    id: string,
}

export interface Course {
    id: string,
    name: string,
    duration: number,
    type: string,
}

export interface Curriculum {
    id: string,
    name: string,
}

export interface Teaching {
    id: string,
    name: string,
}

export interface Contact {
    name: string,
    email: string,
}

export interface Lesson {
    title: string,
    start: Date,
    end: Date,
    location?: string,
    url?: string,
    teacher?: Contact,
}
