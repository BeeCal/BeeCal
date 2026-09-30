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

export interface ESTimeTableEntry {
    codice_insegnamento: string,
    nome_insegnamento: string,
    docente: string,
    mail_docente?: string,
    timestamp: number,
    aula: string,
    ora_inizio: string,
    ora_fine: string,
}