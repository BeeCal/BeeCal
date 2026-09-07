import type { Area, Course, Curriculum } from "beecal-common";

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
}