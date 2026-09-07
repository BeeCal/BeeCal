import type { Area, Course, Curriculum, Teaching } from "beecal-common";

export interface University {
    name: string,
    id: string,
}

export class BeeCalClient {
    getAreas(): Promise<Area[]> {
        return fetch("/api/areas").then(x => x.json());
    }

    getCourses(areaId: string): Promise<Course[]> {
        return fetch("/api/courses?area=" + encodeURIComponent(areaId)).then(x => x.json());
    }

    getCurricula(courseId: string): Promise<Curriculum[]> {
        return fetch("/api/curricula?course=" + encodeURIComponent(courseId)).then(x => x.json());
    }

    getTeachings(course: string, curriculum: string, year: number): Promise<Teaching[]> {
        return fetch(`/api/teachings?course=${encodeURIComponent(course)}&curriculum=${encodeURIComponent(curriculum)}&year=${year}`)
            .then(x => x.json())
    }
}