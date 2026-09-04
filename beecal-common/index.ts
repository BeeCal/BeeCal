export interface TimetableProvider {
    institutionName: string,
    contry: string,
    license: string,

    getAreas(): Promise<Area[]>,
    getCourses(areaId: string): Promise<Course[]>,
    getCurricula(courseId: string): Promise<Curriculum[]>,
    getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]>,
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
