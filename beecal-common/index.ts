export interface TimetableProvider {
    institutionName: string,
    contry: string,
    license: string,

    getAreas(): Promise<Area[]>,
    getCourses(areaId: string): Promise<Course[]>,
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