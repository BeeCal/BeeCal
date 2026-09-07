<script setup lang="ts">
import { BeeCalClient, type University } from '@/client';
import CourseSelector from '@/components/CourseSelector.vue';
import Header from '@/components/Header.vue';
import TeachingsSelector from '@/components/TeachingsSelector.vue';
import { ref } from 'vue';

const client = new BeeCalClient();
const unis = ref<University[] | undefined>([{ id: "it.unibo", name: "Alma Mater Studiorum Università di Bologna" }]);

const course = ref<string>();
const curriculum = ref<string>();
const year = ref<number>();

const teachings = ref<string[]>();

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
    </template>
</template>
