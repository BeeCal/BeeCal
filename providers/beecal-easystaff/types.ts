export interface ESCourse {
    elenco_anni: ESAcademicYear[],
    label: string,
    tipo: string,
    valore: string,
    scuola: string,
}

export interface ESAcademicYear {
    label: string,
    valore: string,
    elenco_insegnamenti: ESTeaching[],
}

export interface ESTeaching {
    label: string,
    valore: string,
}