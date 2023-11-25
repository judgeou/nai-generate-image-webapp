<template>
  <div style="display: flex; flex-wrap: wrap;">
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
          <option v-for="item in artist_tags_styles" :value="item.tags">{{ item.tags.slice(0, 40) }}...</option>
        </select>
      </div>
      <div class="row">
        <textarea cols="50" rows="10" v-model="main_tag"></textarea>
      </div>
      <div class="row">
        <select v-model="size_id">
          <option v-for="item in size_options" :value="item.id">{{ item.label }}</option>
        </select>
      </div>
      <div class="row">
        <button style="width: 100px; height: 40px;" :disabled="isGenerating" @click="generate">Generate</button>
        <button style="width: 100px; height: 40px;" :disabled="isGenerating" @click="enhance">Enhance</button>
        <label>
          <input type="checkbox" v-model="is_auto_save">
          Auto Save
        </label>
        <label>
          <input type="checkbox" v-model="is_blur_image">
          Blur Image
        </label>
      </div>
    </div>

    <div class="right">
      <div class="row" :style="{ width: image_div_width }" @click="switch_size">
        <img v-if="image_src" ref="el_image" :class="{ blur: is_blur_image }" style="width: 100%;" :src="image_src" alt="ai anime image">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from 'vue'
import { artist_tags_styles } from '../lib/candidate-tags'
import { default_input, default_img2img } from '../lib/default-input'
import example_image from '../assets/example.webp'

function load_from_localstorage (name: string, defaultValue: string) {
  return ref(localStorage.getItem('NAI_GENERATE_IMAGE_WEBAPP_' + name) || defaultValue)
}

function watch_save_to_localstorage (name: string, ref_obj: Ref) {
  watch(ref_obj, newValue => {
    localStorage.setItem('NAI_GENERATE_IMAGE_WEBAPP_' + name, newValue.toString())
  })
}

const size_options = [
  {
    id: '1',
    label: '832 x 1216',
    width: 832,
    height: 1216,
    enhance_width: 1280,
    enhance_height: 1856
  },
  {
    id: '2',
    label: '1216 x 832',
    width: 1216,
    height: 832,
    enhance_width: 1856,
    enhance_height: 1280
  },
  {
    id: '3',
    label: '1024 x 1024',
    width: 1024,
    height: 1024,
    enhance_width: 1856,
    enhance_height: 1280
  }
]

const authorization = load_from_localstorage('authorization', '')
const quality_tag = ref('very aesthetic')
const artist_tag = ref('')
const main_tag = ref('1girl, solo')
const isGenerating = ref(false)
const image_src = ref(example_image)
const is_auto_save = ref(false)
const is_blur_image = ref(false)
const size_id = ref('1')

const image_div_width_1 = '400px'
const image_div_width_2 = '832px'
const image_div_width = ref(image_div_width_1)
const el_image = ref<HTMLImageElement>()

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

function notifi (img_url: string) {
  if (Notification.permission === "granted") {
    var notification = new Notification("新消息！", {
      icon: "/novelai-round.png", // 小图标
      image: img_url, // 大图片,
      silent: true
    });

    notification.onclick = function() {
      window.focus()
      this.close()
    };
  }
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

function image_to_base64url () {
  var img = el_image.value!

  var canvas = document.createElement("canvas");
  canvas.width = default_img2img.parameters.width;
  canvas.height = default_img2img.parameters.height;

  var ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  var dataURL = canvas.toDataURL("image/png");
  canvas.remove()

  return dataURL
}

async function enhance () {
  isGenerating.value = true
  try {
    const tags = [ quality_tag.value, artist_tag.value, main_tag.value ].join(', ')
    const post_param = {
      nai_param: {
        ...default_img2img,
        input: tags
      },
      authorization: authorization.value
    }

    const select_size = size_options.find(item => item.id === size_id.value)
    const seed = Math.floor(Math.random() * Math.pow(2, 31))

    post_param.nai_param.parameters.width = select_size!.enhance_width
    post_param.nai_param.parameters.height = select_size!.enhance_height
    post_param.nai_param.parameters.seed = seed
    post_param.nai_param.parameters.extra_noise_seed = seed
    post_param.nai_param.parameters.image = image_to_base64url().split(',')[1]

    const res = await post_json('/api/generate-image', post_param)

    const filename = await res.text()
    const objurl = `/${filename}`

    // URL.revokeObjectURL(image_src.value)
    image_src.value = objurl

    if (is_auto_save.value) {
      downloadImage(objurl)
    }

    notifi(objurl)
  } finally {
    isGenerating.value = false
  }
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
    const select_size = size_options.find(item => item.id === size_id.value)

    post_param.nai_param.parameters.seed = Math.floor(Math.random() * Math.pow(2, 31))
    post_param.nai_param.parameters.width = select_size!.width
    post_param.nai_param.parameters.height = select_size!.height
    const res = await post_json('/api/generate-image', post_param)

    const filename = await res.text()
    const objurl = `/${filename}`

    // URL.revokeObjectURL(image_src.value)
    image_src.value = objurl

    if (is_auto_save.value) {
      downloadImage(objurl)
    }

    notifi(objurl)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.blur {
  filter: blur(20px);
}
.left {

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