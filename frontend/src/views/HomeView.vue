<script setup lang="ts">
import Header from '@/components/Header.vue';

</script>
<template>
    <div class="mt-5">
        <Header />
        <h6>Vuoi inserire i tuoi appuntamenti universitari nel tuo calendario (iCloud, Google, ecc)?<br>Riempi i campi
            qui sotto per cominciare</h6>
    </div>
    <div class="mt-3" id="box">
        <form id="form_calendar" class="form-group" action="/course" method="post" onchange="checkFormValidity();">
            <div class="mb-3">
                <select id="areas" class="form-select" name="areas" onchange="getCoursesGivenArea();">
                    <option value="">--- Seleziona Scuola ---</option>
                    <!--{{ #each areas }}
                    <option value="{{this}}">{{ this }}</option>
                    {{/each}}-->
                </select>
            </div>
            <div id="courses-container" class="mb-3">
                <select id="courses" class="form-select" name="courses" onchange="getYearsAndCurriculaGivenCourse();">
                </select>
                <div class="spinner-border loading-image-invisible" id="courses-loading" role="status"></div>
            </div>
            <div class="mb-3">
                <select id="years" class="form-select" name="years">
                </select>
            </div>
            <div id="curricula-container" class="mb-3">
                <select id="curricula" class="form-select" name="curricula">
                </select>
                <div class="spinner-border loading-image-invisible" id="curricula-loading" role="status"></div>
            </div>
            <div>
                <input type="submit" id="submit-form-button" class="btn btn-primary d-inline" value="Avanti" disabled>
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

.loading-image-invisible {
    display: none;
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