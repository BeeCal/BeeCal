<script setup lang="ts">
import { BeeCalClient, type University } from '@/client';
import CourseSelector from '@/components/CourseSelector.vue';
import Header from '@/components/Header.vue';
import { ref } from 'vue';

const client = new BeeCalClient();
const unis = ref<University[] | undefined>([{ id: "it.unibo", name: "Alma Mater Studiorum Università di Bologna" }]);

</script>
<template>
    <div class="mt-5 mb-3">
        <Header />
    </div>
    <template v-if="unis === undefined">
        <Loading component="le università" />
    </template>
    <template v-else>
        <CourseSelector :universities="unis" />
    </template>
</template>
