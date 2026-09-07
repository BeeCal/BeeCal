<script setup lang="ts">
import { BeeCalClient } from '@/client';
import Header from '@/components/Header.vue';
import Loading from '@/components/Loading.vue';
import { computedAsync } from '@vueuse/core';
import { type Course, type Area, type Curriculum } from 'beecal-common';
import { computed, ref } from 'vue';

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

const curricula = computedAsync<[string, Curriculum[]] | undefined>(async () => {
    if (course.value === undefined) {
        return undefined;
    }
    const c = await client.getCurricula(course.value.id);
    return [course.value.id, c];
});

client.getAreas().then(x => areas.value = x);
</script>
<template>
    <template v-if="areas === undefined">
        <Header />
        <Loading component="le scuole" />
    </template>
    <template v-else>
        <div class="mt-5">
            <Header />
            <h6>Vuoi inserire i tuoi appuntamenti universitari nel tuo calendario (iCloud, Google, ecc)?<br>Riempi i
                campi
                qui sotto per cominciare</h6>
        </div>
        <div class="mt-3" id="box">
            <form id="form_calendar" class="form-group" action="/course" method="post" onchange="checkFormValidity();">
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
                        <option v-for="course in courses" :value="course.id">
                            {{ course.type }} - {{ course.name }}
                        </option>
                    </select>
                </div>
                <div v-if="years.length > 0" class="mb-3">
                    <select id="years" class="form-select" name="years">
                        <option v-for="y in years" :value="y">{{ y }}</option>
                    </select>
                </div>
                <div id="curricula-container" class="mb-3" v-if="courseId != ''">
                    <Loading component="i curriculum" v-if="curricula === undefined || curricula[0] != courseId" />
                    <select v-else class="form-select" name="curricula">
                        <option v-for="curriculum in curricula[1]" :value="curriculum.id">{{ curriculum.name }}</option>
                    </select>
                </div>
                <div>
                    <input type="submit" id="submit-form-button" class="btn btn-primary d-inline" value="Avanti"
                        disabled>
                </div>
                <div id="low-connection">Connessione debole...</div>
            </form>
        </div>
    </template>
</template>
<style lang="css" scoped>
#low-connection {
    color: red;
    display: none;
}

#courses-container {
    display: flex;
    align-items: center;
    /* Regola l'allineamento verticale se necessario */
}

#curricula-container {
    display: flex;
    align-items: center;
    /* Regola l'allineamento verticale se necessario */
}

.custom-select-invisible {
    width: 100%;
}

.custom-select-visible {
    width: calc(100% - 40px);
}

.loading-image-visible {
    display: block;
    width: 30px;
    height: 30px;
    margin-left: 10px;
}
</style>