<template>
  <div class="fixed-img-preview" :style="{ opacity: Number(img_opacity) / 10 }" v-show="is_show_artist_preview">
    <img v-if="artist_preview_img" :src="artist_preview_img" />
  </div>
  <div style="display: flex; flex-wrap: wrap;">
    <div class="left">
      <div class="row">
        <input type="password" placeholder="authorization" v-model="authorization">
      </div>
      <div class="row">
        <input type="text" class="tag-input" v-model="character_tag" placeholder="character_tag">
      </div>
      <div class="row">
        <input type="text" class="tag-input" v-model="quality_tag" placeholder="quality_tag">
      </div>
      <div class="row">
        <input type="text" class="tag-input" v-model="artist_tag" placeholder="artist-tag">
      </div>
      <div class="row" style="width: 80vw;">
        <div class="artist-item" 
        v-for="item in artist_tags_styles"
        @click="click_artist(item, $event)"
        @mouseover="on_artist_over(item)"
        @mouseout="on_artist_out">
          {{ item.name || item.tags.slice(0, 40) }}
        </div>
      </div>
      <div class="row">
        <select v-model="effect_tag">
          <option value="">None</option>
          <option v-for="item in effect_tags" :title="item.tags" :value="item.tags">{{ item.name }}</option>
        </select>

        <button @click="paste_to_tags">paste</button>
      </div>
      <div class="row">
        <textarea cols="50" rows="10" v-model="main_tag"></textarea>
      </div>
      <div>
        <label><input type="checkbox" v-model="sm" >sm</label>
        <label><input type="checkbox" v-model="sm_dyn" >sm_dyn</label>
        <input type="number" min="1" max="20" step="0.5" v-model="scale" placeholder="scale">
      </div>
      <div class="row">
        <select v-model="size_id">
          <option v-for="item in size_options" :value="item.id">{{ item.label }}</option>
        </select>

        <input type="number" placeholder="Generate Number" v-model="generate_number" style="width: 50px;">

        排队：{{ generate_task.length }} 正在运行：{{ runing_task.length }}
      </div>
      <div class="row">
        <button style="width: 100px; height: 40px;" :disabled="isGenerating" @click="generate(generate_number)">Generate</button>
        <button style="width: 100px; height: 40px;" :disabled="isGenerating" @click="enhance">Enhance</button>
        <button style="width: 100px; height: 40px;"  @click="generate_task.length = 0">Clear</button>
        <button style="height: 40px;" @click="xyz_batch">xyz_batch</button>
        <button style="height: 40px;" @click="randomBatch">Random</button>
      </div>
      <div>
        <label>
          <input type="checkbox" v-model="is_auto_save">
          Auto Save
        </label>
        <label>
          <input type="checkbox" v-model="is_blur_image">
          Blur Image
        </label>

        Opacity: <input type="number" v-model="img_opacity" min="0" max="10" >
        Padding: <input type="number" v-model="img_padding" min="0" max="100">
      </div>
    </div>

    <div class="right" :style="{ opacity: Number(img_opacity) / 10 }">
      <div v-for="item in img_list" :style="{ width: image_div_width, display: 'inline-block', padding: `${img_padding}px` }" @click="switch_size">
        <img ref="el_image" :class="{ blur: is_blur_image }" style="width: 100%;" :src="item" alt="ai anime image">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, reactive, onUnmounted } from 'vue'
import { artist_tags_styles, effect_tags, ArtistItem } from '../lib/candidate-tags'
import { get_default_input, get_default_img2img } from '../lib/default-input'
// import example_image from '../assets/example.webp'

const default_input_one = get_default_input()

interface SendParam {
  nai_param: typeof default_input_one
  authorization: string
}

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
  },
  {
    id: '4',
    label: '1024 x 1536',
    width: 1024,
    height: 1536,
    enhance_width: 1280,
    enhance_height: 1856
  }
]

const authorization = load_from_localstorage('authorization', '')
const character_tag = ref('')
const quality_tag = ref('very aesthetic')
const artist_tag = ref('')
const effect_tag = ref('')
const main_tag = ref('1girl, solo')
const isGenerating = ref(false)
const is_auto_save = ref(true)
const is_blur_image = ref(false)
const size_id = ref('1')
const generate_number = ref(2)
const img_opacity = ref(load_from_localstorage('img_opacity', '10'))
const img_padding = ref(load_from_localstorage('img_padding', '8'))
const sm = ref(false)
const sm_dyn = ref(false)
const scale = ref(4.0)

const image_div_width_1 = '23%'
const image_div_width_2 = '832px'
const image_div_width = ref(image_div_width_1)
const el_image = ref<HTMLImageElement[]>()
const is_show_artist_preview = ref(false)
const artist_preview_img = ref('')

const generate_task = reactive([] as SendParam[])
const runing_task = reactive([] as SendParam[])
const img_list = reactive([ ] as string[])
let t1 = new Date()
let isRunning = true

watch_save_to_localstorage('authorization', authorization)
watch_save_to_localstorage('img_opacity', img_opacity)
watch_save_to_localstorage('img_padding', img_padding)

function click_artist (artist_item: ArtistItem, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey) {
    artist_tag.value += ', ' + artist_item.tags
  } else {
    artist_tag.value = artist_item.tags
  }
}

function on_artist_over (artist_item: ArtistItem) {
  is_show_artist_preview.value = true
  artist_preview_img.value = artist_item.img || ''
}

function on_artist_out () {
  is_show_artist_preview.value = false
}

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

function paste_to_tags () {
  navigator.clipboard.readText().then(text => {
    main_tag.value = text
  })
}

function notifi (img_url: string | null, cost_time: number) {
  const userAgent = navigator.userAgent
  const is_android = /Android/i.test(userAgent);
  
  if (is_android) {
    return
  }

  if (window.Notification && Notification.permission === "granted") {
    var notification = new Notification("新消息！", {
      body: `${(cost_time / 1000).toFixed(2)}s`,
      icon: "/novelai-round.png", // 小图标
      image: img_url || '/novelai-round.png', // 大图片,
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
  var img = el_image.value![0]

  var canvas = document.createElement("canvas");
  const default_img2img = get_default_img2img()
  canvas.width = default_img2img.parameters.width;
  canvas.height = default_img2img.parameters.height;

  var ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  var dataURL = canvas.toDataURL("image/png");
  canvas.remove()

  return dataURL
}

function get_tags_text () {
  const mt = main_tag.value
  const tags = [ character_tag.value, artist_tag.value, effect_tag.value, quality_tag.value, mt ].join(', ')
  return tags.replace(/\\\(/g, '(').replace(/\\\)/g, ')')
}

async function enhance () {
  t1 = new Date()

  {
    const default_img2img = get_default_img2img()
    const tags = get_tags_text()
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
    post_param.nai_param.parameters.sm = sm.value
    post_param.nai_param.parameters.sm_dyn = sm_dyn.value
    post_param.nai_param.parameters.scale = scale.value

    generate_task.push(post_param)

  }
}

async function generate (num = 1) {
  t1 = new Date()

  for (let i = 0; i < num; i++) {
    const default_input = get_default_input()
    const tags = get_tags_text()
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
    post_param.nai_param.parameters.sm = sm.value
    post_param.nai_param.parameters.sm_dyn = sm_dyn.value
    post_param.nai_param.parameters.scale = scale.value

    generate_task.push(post_param)
  }
}

async function send_action (post_param: SendParam) {
  let filename = ''

  while (1) {
    try {
      const res = await post_json('/api/generate-image', post_param)
      filename = await res.text()
      if (/.+\.png/.test(filename)) {
        break
      } else if (filename[0] === '{') {
        const jsonobj = JSON.parse(filename)
        if (jsonobj.statusCode === 400) {
          alert(jsonobj.message)
          return
        }
      }
    } catch {
      continue
    }
  }
  
  const objurl = `/api/image/${filename}`

  // URL.revokeObjectURL(image_src.value)
  img_list.unshift(objurl)

  if (img_list.length > 20) {
    img_list.pop()
  }

  if (is_auto_save.value) {
    downloadImage(objurl)
  }
}

async function xyz_batch () {
  const image_class_tags = [
    ['multicolored_hair', ''],
    ['long_hair', 'short_hair'],
    ['outdoors', 'indoors'],
    ['zettai_ryouiki, thighhighs', 'full_body black_pantyhose', 'upper_body', 'full_body, white_pantyhose', 'topless'],
    ['black_hair', 'white_hair', 'blonde_hair', 'red_hair', 'blue_hair']
  ]

  const all_combines = [] as string[]

  for (let t1 of image_class_tags[0]) {
    for (let t2 of image_class_tags[1]) {
      for (let t3 of image_class_tags[2]) {
        for (let t4 of image_class_tags[3]) {
          for (let t5 of image_class_tags[4]) {
            all_combines.push([ t1, t2, t3, t4, t5 ].join(', '))
          }
        }
      }
    }
  }

  for (let base_tag of all_combines) {
    const default_input = get_default_input()
    const tags = get_tags_text() + ', ' + base_tag
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
    post_param.nai_param.parameters.sm = sm.value
    post_param.nai_param.parameters.sm_dyn = sm_dyn.value
    post_param.nai_param.parameters.scale = scale.value

    generate_task.push(post_param)
  }
}

async function randomBatch () {
  const res1 = await post_json('http://localhost:5000/api/random/3', { "rating":"s","and_array":["1girl","solo"],"or_array":[["outdoors","indoors"]],"limit":100})
  const posts = await res1.json()

  for (let post of posts) {
    const { tags } = post
    main_tag.value = tags
    generate(1)
  }
}

async function beginLoop () {
  while (isRunning) {
    if (generate_task.length > 0 && runing_task.length < 1) {
      const param = generate_task.shift()!
      
      runing_task.push(param)
      await send_action(param)
      runing_task.splice(runing_task.indexOf(param), 1)

      if (generate_task.length === 0 && runing_task.length === 0) {
        const t2 = new Date()
        const t = t2.getTime() - t1.getTime()

        notifi(null, t)
      }
    }

    await new Promise(r => setTimeout(r, 1000))
  }
}

onUnmounted(() => {
  isRunning = false
})

beginLoop()
</script>

<style scoped>
.fixed-img-preview {
  position: fixed;
  z-index: -1;
  top: 0;
  right: 0;
  width: 400px;
}
.fixed-img-preview img {
  width: 100%;
}
.artist-item {
  padding: 4px;
  border: 1px solid pink;
  cursor: pointer;
}
.blur {
  filter: blur(20px);
}
.left {

}
.right {
  max-width: 99vw;
  flex-grow: 1;
}
.tag-input {
  width: 400px;
}
.row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
</style>