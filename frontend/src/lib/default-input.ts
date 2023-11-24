const default_input = {
  "input": "very aesthetic, artist:baku-p, loli, 1girl, solo, dress, smile, blue_eyes, black_hair, hairband, looking_at_viewer, short_hair, frills, head_tilt, long_sleeves, bangs, cowboy_shot, closed_mouth, frilled_dress, character_name, standing, striped_background, black_dress, bob_cut, collared_dress, striped",
  "model": "nai-diffusion-3",
  "action": "generate",
  "parameters": {
    "width": 832,
    "height": 1216,
    "scale": 5,
    "sampler": "k_dpmpp_sde",
    "steps": 28,
    "n_samples": 1,
    "ucPreset": 2,
    "qualityToggle": false,
    "sm": false,
    "sm_dyn": false,
    "dynamic_thresholding": false,
    "controlnet_strength": 1,
    "legacy": false,
    "add_original_image": false,
    "uncond_scale": 1,
    "cfg_rescale": 0,
    "noise_schedule": "native",
    "seed": 2348809611,
    "negative_prompt": "lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, unfinished, chromatic aberration, extra digits, artistic error, scan, [abstract], {worst quality}, jpeg artifacts, {bad quality}, normal quality,"
  }
}

export {
  default_input
}
