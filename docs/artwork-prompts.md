# AI 同人插画：来源、提示词与使用方式

本项目使用内置 image_gen 图像生成工具（非 CLI / API 回退）创作三款角色插画。它们是非官方 AI 同人创作，不是真实演出照片，也不代表艺人授权或官方形象。

## 已保存的项目素材

| 文件 | 参考造型 | 参考照片与摄影 |
| --- | --- | --- |
| `assets/art/rock-star.png` | 银黑舞台服、红色披肩、侧编发、高举金色麦克风 | [2015香港演出](https://commons.wikimedia.org/wiki/File:GEM_HK_Rolling_in_the_deep.JPG)，茂木木，CC BY-SA 4.0 |
| `assets/art/silver-stage.png` | 白色上衣、银色短裤、黑色宽松外套、渐变卷发 | [2017广州 Queen of Hearts](https://commons.wikimedia.org/wiki/File:2017年4月1日廣州Queen_of_Hearts_1.jpg)，茂木木，CC BY-SA 4.0 |
| `assets/art/guitar-dream.png` | 白色外套、侧分卷发、银色吉他 | [2014上海演出](https://commons.wikimedia.org/wiki/File:Gem_singing_with_guitar.JPG)，茂木木，CC BY-SA 4.0 |

三个 PNG 均为 1024 × 1536、RGBA 透明背景。原始图像完整保留，用于 Canvas 应援卡合成；页面展示另用等比缩小的 WebP 副本以减少加载量。

## 许可与署名

上述三款角色为对参考照片中服饰和姿态的艺术演绎，随项目按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 提供。建议署名：

“GEMVERSE 非官方 AI 同人创作；造型参考摄影：茂木木（原图链接见本文件），CC BY-SA 4.0；由图像生成工具重绘。”

作品涉及真实艺人的姓名与形象。该素材许可不表示艺人背书，也不改变姓名、肖像或相关第三方权利。作品封面、歌词和其他摄影素材应分别查看各自许可。

## 生成时使用的完整提示词

每次只生成一个角色；分别向工具传入表中对应的演出照片作为参考。三张图使用同样的画风描述。

### rock-star

参考文件：`assets/photos/concert-04.jpg`。工具参数：`transparent_background: true`。

```text
Use case: stylized-concept. Asset type: transparent website character sticker for a G.E.M. 邓紫棋 fan-made classroom music website. Input image 1 is a wardrobe and hairstyle reference, not an edit target. Create ONE adorable full-body chibi fan-art illustration inspired by this real adult singer's concert appearance. black and silver sparkling jumpsuit, short scarlet red military shoulder cape with silver lining, side-swept voluminous warm-brown curls and tight tiny side braids, right arm lifting a golden microphone into the air, bold happy expression. Style: premium editorial sticker illustration with clean hand-drawn deep purple outlines, soft pastel cel shading, expressive glossy dark eyes, rosy cheeks, sweet adult chibi proportions (large head, short body), not photorealistic, not a toy render. Composition: full body centered, whole hairstyle, hands, shoes and any instrument visible, comfortable padding, no cropping. Subtle pale lavender sticker rim around silhouette, few tiny lavender four-point sparkles. Neutral studio illumination. No text, letters, brands, logo, watermark or background; genuinely transparent alpha background. Clearly an artistic fan tribute, warm and joyful. Keep outfit details recognizable from the reference while simplifying them tastefully.
```

### silver-stage

参考文件：`assets/photos/concert-01.jpg`。工具参数：`transparent_background: true`。

```text
Use case: stylized-concept. Asset type: transparent website character sticker for a G.E.M. 邓紫棋 fan-made classroom music website. Input image 1 is a wardrobe and hairstyle reference, not an edit target. Create ONE adorable full-body chibi fan-art illustration inspired by this real adult singer's concert appearance. white sporty crop top, reflective silver shorts, loose long black open coat with simple white trim (NO readable lettering), tiny fishnet accents at knees, black boots, long dark wavy hair fading to reddish brown at tips, holding gold microphone, left hand making a victory sign. Style: premium editorial sticker illustration with clean hand-drawn deep purple outlines, soft pastel cel shading, expressive glossy dark eyes, rosy cheeks, sweet adult chibi proportions (large head, short body), not photorealistic, not a toy render. Composition: full body centered, whole hairstyle, hands, shoes and any instrument visible, comfortable padding, no cropping. Subtle pale lavender sticker rim around silhouette, few tiny lavender four-point sparkles. Neutral studio illumination. No text, letters, brands, logo, watermark or background; genuinely transparent alpha background. Clearly an artistic fan tribute, warm and joyful. Keep outfit details recognizable from the reference while simplifying them tastefully.
```

### guitar-dream

参考文件：`assets/photos/concert-06.jpg`。工具参数：`transparent_background: true`。

```text
Use case: stylized-concept. Asset type: transparent website character sticker for a G.E.M. 邓紫棋 fan-made classroom music website. Input image 1 is a wardrobe and hairstyle reference, not an edit target. Create ONE adorable full-body chibi fan-art illustration inspired by this real adult singer's concert appearance. tailored white long-sleeve jacket with a fully covered white shirt, silver glitter acoustic guitar with dark decorative shoulder strap, warm brown side-swept curly long hair, singing gently into a microphone on a stand, little closed-eye smile. Style: premium editorial sticker illustration with clean hand-drawn deep purple outlines, soft pastel cel shading, expressive glossy dark eyes, rosy cheeks, sweet adult chibi proportions (large head, short body), not photorealistic, not a toy render. Composition: full body centered, whole hairstyle, hands, shoes and any instrument visible, comfortable padding, no cropping. Subtle pale lavender sticker rim around silhouette, few tiny lavender four-point sparkles. Neutral studio illumination. No text, letters, brands, logo, watermark or background; genuinely transparent alpha background. Clearly an artistic fan tribute, warm and joyful. Keep outfit details recognizable from the reference while simplifying them tastefully.
```

