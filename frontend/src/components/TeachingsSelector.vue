<script setup lang="ts">
import { BeeCalClient } from '@/client';
import Loading from './Loading.vue';
import type { Teaching } from 'beecal-common';
import { computed, ref } from 'vue';

const props = defineProps<{ course: string, curriculum: string, year: number }>();
const emit = defineEmits<{ selected: [teachings: string[]] }>();
const teachings = ref<[Teaching, boolean][]>();
const allSelected = computed(() => (teachings.value || []).reduce((prev, cur) => prev && cur[1], true));
const selected = computed(() => teachings.value?.filter(x => x[1]).map(x => x[0].id));

function toggleSelection() {
    const v = !allSelected.value;
    teachings.value?.forEach(x => x[1] = v);
}

const client = new BeeCalClient();
client.getTeachings(props.course, props.curriculum, props.year).then(x => teachings.value = x.map(x => [x, true]));
</script>
<template>
    <Loading component="gli insegnamenti" v-if="teachings === undefined" />
    <template v-else>
        <h6>Seleziona solo gli insegnamenti che intendi inserire nel tuo calendario</h6>
        <div class="mt-3" id="box">
            <button @click="toggleSelection()" class="btn btn-secondary">{{ allSelected ? "Deseleziona" : "Seleziona" }}
                tutti</button>
            <div class="container">
                <form>
                    <div class="row">
                        <table>
                            <tr v-for="teaching in teachings">
                                <td><input type="checkbox" class="checkbox" v-model="teaching[1]" value=""
                                        :id="teaching[0].id" /></td>
                                <td><label :for="teaching[0].id">{{ teaching[0].name }}</label></td>
                            </tr>
                        </table>
                    </div>
                    <input :disabled="(selected || []).length === 0" @click="emit('selected', selected!)" type="button"
                        class="btn btn-primary" value="Ottieni Calendario" />
                </form>
            </div>
        </div>
    </template>
</template>

<style lang="css" scoped>
label {
    margin-bottom: 0;
    margin-left: 2%;
    font-weight: normal;
}

table {
    width: 100%;
}

td {
    padding-bottom: 0.8%;
}

.btn {
    margin-bottom: 1.5%;
}

.row {
    width: 100%;
    display: block;
}

input[type="submit"] {
    margin-top: 1%;
}
</style>