export interface TimetableProvider {
    institutionName: string,
    contry: string,
    license: string,

    getAreas(): Promise<Area[]>,
}

export interface Area {
    name: string,
    id: string,
}