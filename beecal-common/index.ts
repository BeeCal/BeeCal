export interface TimetableProvider {
    institutionName: string,
    contry: string,
    license: string,

    getAreas(): Promise<Area[]>,
    getCourses(areaId: string): Promise<Course[]>,
    getCurricula(courseId: string): Promise<Curriculum[]>,
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