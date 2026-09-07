<script setup lang="ts">
import { BeeCalClient, type University } from '@/client';
import Loading from '@/components/Loading.vue';
import { computedAsync } from '@vueuse/core';
import { type Course, type Area, type Curriculum } from 'beecal-common';
import { computed, ref, watch } from 'vue';

defineProps<{ universities: University[] }>();
const emit = defineEmits<{
    select: [course: string, curriculum: string, year: number]
}>();

const client = new BeeCalClient();

const areas = ref<Area[] | undefined>();
const area = ref("");

const courses = computedAsync<Course[] | undefined>(async () => {
    if (areas === undefined) {
        return undefined;
    }
    const c = await client.getCourses(area.value);
    c.sort((a, b) => {
        return a.type === b.type ? (a.name > b.name ? 1 : -1) : (a.type > b.type ? 1 : -1);
    })

    return c;
});
const courseId = ref("");
const course = computed<Course | undefined>(() => (courses.value || []).find(x => x.id == courseId.value));

const years = computed(() => {
    const res: number[] = [];
    if (course.value !== undefined) {
        for (let i = 0; i < course.value?.duration; i += 1) {
            res.push(i + 1);
        }
    }
    return res;
});
watch(years, () => year.value = years.value[0]);
const year = ref<number | undefined>();

const curricula = computedAsync<[string, Curriculum[]] | undefined>(async () => {
    if (course.value === undefined) {
        return undefined;
    }
    const c = await client.getCurricula(course.value.id);
    return [course.value.id, c];
});
const curriculum = ref("");

client.getAreas().then(x => areas.value = x);
</script>
<template>
    <div>
        <h6>Vuoi inserire i tuoi appuntamenti universitari nel tuo calendario (iCloud, Google, ecc)?<br>Riempi i
            campi
            qui sotto per cominciare</h6>
    </div>
    <div class="mt-3" id="box">
        <form id="form_calendar" class="form-group">
            <div class="mb-3">
                <Loading component="le scuole" v-if="areas === undefined" />
                <select v-else v-model="area" class="form-select" name="areas" @change="courses = undefined">
                    <option value="">--- Seleziona Scuola ---</option>
                    <option v-for="area in areas" :value="area.id">{{ area.name }}</option>
                </select>
            </div>
            <div id="courses-container" class="mb-3" v-if="area !== ''">
                <Loading component="i corsi" v-if="courses === undefined" />
                <select v-else v-model="courseId" class="form-select" name="courses">
                    <option value="">--- Seleziona Corso ---</option>
                    <option v-for="course in courses" :value="course.id">
                        {{ course.type }} - {{ course.name }}
                    </option>
                </select>
            </div>
            <div v-if="years.length > 0" class="mb-3">
                <select v-model="year" class="form-select" name="years">
                    <option v-for="y in years" :value="y">{{ y }}</option>
                </select>
            </div>
            <div class="mb-3" v-if="courseId != ''">
                <Loading component="i curriculum" v-if="curricula === undefined || curricula[0] != courseId" />
                <select v-model="curriculum" v-else class="form-select" name="curricula">
                    <option value="">--- Seleziona Curriculum ---</option>
                    <option v-for="curriculum in curricula[1]" :value="curriculum.id">{{ curriculum.name }}</option>
                </select>
            </div>
            <div>
                <button class="btn btn-primary d-inline"
                    :disabled="course === undefined || year === undefined || curriculum == ''">Avanti</button>
            </div>
            <div id="low-connection">Connessione debole...</div>
        </form>
    </div>
</template>
<style lang="css" scoped>
#low-connection {
    color: red;
    display: none;
}
</style>