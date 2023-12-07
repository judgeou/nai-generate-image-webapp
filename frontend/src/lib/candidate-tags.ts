import cokecoco_1 from '../assets/artist-preview/cokecoco_1.webp'
import kedama_milk_1 from '../assets/artist-preview/kedama_milk_1.webp'
import kedama_milk_2 from '../assets/artist-preview/kedama_milk_2.webp'
import mirage_1 from '../assets/artist-preview/mirage_1.webp'
import houkisei_1 from '../assets/artist-preview/houkisei_1.webp'
import tantan_1 from '../assets/artist-preview/tantan_1.webp'
import houtu_1 from '../assets/artist-preview/houtu_1.webp'
import jianyue_1 from '../assets/artist-preview/jianyue_1.webp'
import loli_1 from '../assets/artist-preview/loli_1.webp'
import loli_2 from '../assets/artist-preview/loli_2.webp'
import morikura_1 from '../assets/artist-preview/morikura_1.webp'
import morikura_2 from '../assets/artist-preview/morikura_2.webp'
import hokori_sakuni from '../assets/artist-preview/hokori_sakuni.webp'
import kanda_done from '../assets/artist-preview/kanda_done.webp'

const artist_tags_styles = [
  {
    name: 'cokecoco_1',
    tags: 'cokecoco, haoni,[artist:kedama milk],{wlop}[[artist:As109]]',
    img: cokecoco_1
  },
  {
    name: 'kedama milk_1',
    tags: 'kedama_milk, [fuzichoco], [ogipote]',
    img: kedama_milk_1
  },
  {
    name: 'kedama milk_2',
    tags: 'kedama_milk, wlop, [ogipote]',
    img: kedama_milk_2
  },
  {
    name: 'mirage_1',
    tags: 'year_2023, mirage_(rairudiseu), nasii',
    img: mirage_1
  },
  {
    name: 'houkisei',
    tags: 'year_2023, torino_aqua, houkisei',
    img: houkisei_1
  },
  {
    name: 'tantan_1',
    tags: 'tantan_men_(dragon),satou_(3366_s) ,yuizaki_kazuya,jyt,year_2023',
    img: tantan_1
  },
  {
    name: '厚涂1',
    tags: '[[omone_hokoma_agm,free_style_(yohan1754)]],{shion_(mirudakemann), [wlop],{asakuraf}}',
    img: houtu_1
  },
  {
    name: '简约',
    tags: 'tomari_(veryberry00), najar, eluthel,jyt',
    img: jianyue_1
  },
  {
    name: 'loli_1',
    tags: 'artist:baku-p, loli',
    img: loli_1
  },
  {
    name: 'loli_2',
    tags: 'arist:henreader,artist:baku-p,artist:tyakomes',
    img: loli_2
  },
  {
    name: 'morikura_1',
    tags: '{artist:morikura_en}, [artist:ogipote]',
    img: morikura_1
  },
  {
    name: 'morikura_2',
    tags: '[artist:morikura_en], artist:sincos',
    img: morikura_2
  },
  {
    tags: 'artist:hokori_sakuni',
    img: hokori_sakuni
  },
  {
    tags: 'artist:kanda_done',
    img: kanda_done
  },
  {
    tags: 'artist:morikura_en, [artist:ogipote], nijisanji'
  },
  {
    tags: 'artist:morikura_en, [artist:ogipote], artist:qian_wu_atai'
  },
  {
    tags: 'artist:morikura_en, [artist:ogipote], artist:e20'
  },
  {
    tags: '[artist:morikura_en], artist:chiyingzai'
  },
  {
    tags: '[[artist:mignon]], [[artist:sazaki_ichiri]]'
  },
  {
    tags: '[[artist:goldowl]]'
  },
  {
    tags: 'artist:ningen_mame,artist:ciloranko,[artist:sho_(sho_lwlw)]'
  },
  {
    tags: '[[izumi tsubasu]] [[[fkey]]] [loli]] [mashiroiro symphony sena airi]'
  },
  {
    name: 'blue archive_1',
    tags: 'artist:asou_(asabu202),artist:fuzichoco,artist:ogipote,[[artist:piyodera_mucha]]'
  },
  {
    name: 'yuzu mignon',
    tags: 'Yuzusoft,senren banka, chen bin,atdan,hito,hiten,mignon'
  },
  {
    name: '践踏1',
    tags: 'from below,Yuzusoft,Senren Banka,sitting,stampede  pov, anime, ωstar, chen bin, year 2022,atdan,hito,hiten,mignon,loli,white pantyhose,toes'
  }
]

const effect_tags = [
  {
    name: '封面鱼眼',
    tags: 'album cover, blurry, fisheye'
  },{
    name: '封面',
    tags: 'album cover'
  },{
    name: '官方光影景深',
    tags: 'official art, depth of field,{cinematic lighting},dutch angle'
  }
]

interface ArtistItem {
  name?: string
  tags: string
  img?: string
}

export {
  artist_tags_styles,
  effect_tags
}

export type {
  ArtistItem
}

// artist:arata_(xin) 变厚
// artist:sazaki_ichiri 
// artist:emia_(castilla)
// artist:tomari_(veryberry00)