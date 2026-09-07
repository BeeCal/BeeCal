<script setup lang="ts">
import { BeeCalClient, type University } from '@/client';
import Calendar from '@/components/Calendar.vue';
import CourseSelector from '@/components/CourseSelector.vue';
import Header from '@/components/Header.vue';
import TeachingsSelector from '@/components/TeachingsSelector.vue';
import { computedAsync } from '@vueuse/core';
import { ref } from 'vue';

const client = new BeeCalClient();
const unis = ref<University[] | undefined>([{ id: "it.unibo", name: "Alma Mater Studiorum Università di Bologna" }]);

const course = ref<string>();
const curriculum = ref<string>();
const year = ref<number>();

const teachings = ref<string[]>();
const calId = computedAsync(async () => teachings.value === undefined ? undefined : client.getCalId(course.value!, curriculum.value!, year.value!, teachings.value!))

</script>
<template>
    <div class="mt-5 mb-3">
        <Header />
    </div>
    <template v-if="unis === undefined">
        <Loading component="le università" />
    </template>
    <template v-else>
        <CourseSelector :universities="unis"
            v-if="course === undefined || curriculum === undefined || year === undefined" @select="(selCourse, selCurriculum, selYear) => {
                course = selCourse;
                curriculum = selCurriculum;
                year = selYear;
            }" />
        <TeachingsSelector
            v-if="course !== undefined && curriculum !== undefined && year !== undefined && teachings === undefined"
            :course="course" :curriculum="curriculum" :year="year" @selected="x => teachings = x" />
        <Calendar :id="calId" v-if="calId !== undefined" />
    </template>
</template>
