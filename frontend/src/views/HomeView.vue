<script setup lang="ts">
import { BeeCalClient, type University } from '@/client';
import Calendar from '@/components/Calendar.vue';
import CourseSelector from '@/components/CourseSelector.vue';
import Header from '@/components/Header.vue';
import Loading from '@/components/Loading.vue';
import TeachingsSelector from '@/components/TeachingsSelector.vue';
import { computedAsync } from '@vueuse/core';
import { computed, ref } from 'vue';

const client = new BeeCalClient();
const unis = ref<University[] | undefined>([{ id: "it.unibo", name: "Alma Mater Studiorum Università di Bologna" }]);

const course = ref<string>();
const curriculum = ref<string>();
const year = ref<number>();

const teachings = ref<string[]>();
const calId = computedAsync(async () => teachings.value === undefined ? undefined : client.getCalId(course.value!, curriculum.value!, year.value!, teachings.value!))

const coursePickerShown = computed(() => course === undefined || curriculum === undefined || year === undefined);
const teachingsPickerShown = computed(() => !coursePickerShown.value && teachings === undefined);

</script>
<template>
    <div class="mt-5 mb-3">
        <Header />
    </div>
    <template v-if="unis === undefined">
        <Loading component="le università" />
    </template>
    <template v-else>
        <CourseSelector :universities="unis" v-if="coursePickerShown" @select="(selCourse, selCurriculum, selYear) => {
            course = selCourse;
            curriculum = selCurriculum;
            year = selYear;
        }" />
        <TeachingsSelector v-if="teachingsPickerShown" :course="course!" :curriculum="curriculum!" :year="year!"
            @selected="x => teachings = x" />
        <Loading v-if="!teachingsPickerShown && calId === undefined" component="il tuo calendario" />
        <Calendar :id="calId" v-if="calId !== undefined" />
    </template>
</template>
