import { Area, Course, Curriculum, Lesson, Teaching, TimetableProvider } from "beecal-common/dist";

const SEPARATOR = '%';

function prependId(pre: string, post: string): string {
    return [pre, post].join(SEPARATOR);
}

function extractParts(id: string): [string, string] {
    const splitPosition = id.indexOf(SEPARATOR);
    return [id.slice(0, splitPosition - 1), id.slice(splitPosition + 1)];
}

export interface Institution {
    id: string,
    name: string,
    country: string,
    license: string,
}

export class MergeProvider implements TimetableProvider {
    institutionName: string = "";
    country: string = "ww";
    license: string = "";
    institutions = new Map<string, TimetableProvider>();

    getInstitutions(): Institution[] {
        return Array.from(this.institutions.entries())
            .map(x => {
                return {
                    id: x[0],
                    name: x[1].institutionName,
                    country: x[1].country,
                    license: x[1].license,
                }
            })
    }

    #getInstitution(id: string): TimetableProvider {
        const institution = this.institutions.get("id");
        if (institution === undefined) {
            throw new Error("The requested institution was not found");
        }
        return institution;
    }

    /**
     * Don't call!
     */
    getAreas(): Promise<Area[]> {
        throw new Error("Method not implemented. Call getInstitutionAreas() instead");
    }

    async getInstitutionAreas(institutionId: string): Promise<Area[]> {
        const institution = this.#getInstitution(institutionId);
        const areas = await institution.getAreas();
        return areas.map(x => { return { ...x, id: prependId(institutionId, x.id) } });
    }

    async getCourses(areaId: string): Promise<Course[]> {
        const [institutionId, localAreaId] = extractParts(areaId);
        const institution = this.#getInstitution(institutionId);
        const courses = await institution.getCourses(localAreaId);
        return courses.map(x => { return { ...x, id: prependId(institutionId, x.id) } });

    }

    getCurricula(courseId: string): Promise<Curriculum[]> {
        const [institutionId, localCourseId] = extractParts(courseId);
        const institution = this.#getInstitution(institutionId);
        return institution.getCurricula(localCourseId);
    }
    getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]> {
        throw new Error("Method not implemented.");
    }
    getLessons(courseId: string, curriculum: string, year: number, teachingIDsFilter?: Set<string>): Promise<Lesson[]> {
        throw new Error("Method not implemented.");
    }
}