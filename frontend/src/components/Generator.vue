<template>
  <div style="display: flex;">
    <div class="left">
      <div class="row">
        <input type="password" placeholder="authorization" v-model="authorization">
      </div>
      <div class="row">
        <input type="text" class="tag-input" v-model="quality_tag" placeholder="quality_tag">
      </div>
      <div class="row">
        
        <select v-model="artist_tag">
          <option value="">None</option>
          <option v-for="item in artist_tags_styles" :value="item.tags">{{ item.tags.slice(0, 30) }}...</option>
        </select>
      </div>
      <div class="row">
        <textarea cols="50" rows="10" v-model="main_tag"></textarea>
      </div>
      <div class="row">
        <button style="width: 100px; height: 40px;" :disabled="isGenerating" @click="generate">Generate</button>
        <label>
          <input type="checkbox" v-model="is_auto_save">
          Auto Save
        </label>
      </div>
    </div>

    <div class="right">
      <div class="row" :style="{ width: image_div_width }" @click="switch_size">
        <img v-if="image_src" style="width: 100%;" :src="image_src" alt="ai anime image">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue'
import { artist_tags_styles } from '../lib/candidate-tags'
import { default_input } from '../lib/default-input'

function load_from_localstorage (name: string, defaultValue: string) {
  return ref(localStorage.getItem('NAI_GENERATE_IMAGE_WEBAPP_' + name) || defaultValue)
}

function watch_save_to_localstorage (name: string, ref_obj: Ref) {
  watch(ref_obj, newValue => {
    localStorage.setItem('NAI_GENERATE_IMAGE_WEBAPP_' + name, newValue.toString())
  })
}

const authorization = load_from_localstorage('authorization', '')
const quality_tag = ref('very aesthetic')
const artist_tag = ref('')
const main_tag = ref('1girl, solo')
const isGenerating = ref(false)
const image_src = ref('')
const is_auto_save = ref(false)

const image_div_width_1 = '400px'
const image_div_width_2 = '100%'
const image_div_width = ref(image_div_width_1)

watch_save_to_localstorage('authorization', authorization)

async function post_json (path: string, data: any) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })

  return res
}

function switch_size () {
  if (image_div_width.value === image_div_width_1) {
    image_div_width.value = image_div_width_2
  } else {
    image_div_width.value = image_div_width_1
  }
}

function downloadImage (url: string) {
    // Create a temporary link element
    const tempLink = document.createElement('a');
    tempLink.href = url;

    // Set the filename for the downloaded image
    // Append a default extension if not provided
    tempLink.download = main_tag.value + '.png';

    // Append the link to the body, click it, and then remove it
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

async function generate () {
  isGenerating.value = true
  try {
    const tags = [ quality_tag.value, artist_tag.value, main_tag.value ].join(', ')
    const post_param = {
      nai_param: {
        ...default_input,
        input: tags
      },
      authorization: authorization.value
    }
    post_param.nai_param.parameters.seed = Math.floor(Math.random() * Math.pow(2, 31))
    const res = await post_json('/api/generate-image', post_param)

    const blob = await res.blob()
    const objurl = URL.createObjectURL(blob)
    image_src.value = objurl

    if (is_auto_save.value) {
      downloadImage(objurl)
    }
    
    setTimeout(() => {
      URL.revokeObjectURL(objurl)
    }, 1000)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.left {
  flex-grow: 1;
}
.right {
  flex-grow: 1;
}
.tag-input {
  width: 400px;
}
.row {
  margin-bottom: 8px;
}
</style>