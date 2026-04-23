# Free Local Image Generation

WeaR now keeps image generation behind one server endpoint:

```txt
POST /api/wardrobe/generate-image
```

The UI does not talk directly to model tools. The server chooses a local provider and falls back to the built-in wardrobe collage if the provider is unavailable.

## Default

```env
IMAGE_PROVIDER=local-collage
```

This is always free and always available. It creates the existing wardrobe collage preview without external services.

## LocalAI

Use this when LocalAI is running with an image backend:

```env
IMAGE_PROVIDER=localai
LOCALAI_BASE_URL=http://127.0.0.1:8080
LOCALAI_IMAGE_MODEL=flux.1-dev-ggml
LOCALAI_IMAGE_SIZE=1024x1024
LOCALAI_IMAGE_STEPS=25
```

WeaR calls:

```txt
POST /v1/images/generations
```

The adapter sends the generated outfit prompt and, when possible, the selected wardrobe images as reference inputs. LocalAI backends differ, so this path is best for free local experimentation and general outfit previews.

## ComfyUI

Use this when a ComfyUI workflow is installed locally:

```env
IMAGE_PROVIDER=comfyui
COMFYUI_BASE_URL=http://127.0.0.1:8188
COMFYUI_WORKFLOW_PATH=docs/workflows/catvton-api-workflow.json
COMFYUI_TIMEOUT_MS=180000
```

The workflow file must be exported in ComfyUI API format. WeaR replaces these string tokens anywhere in the JSON before queueing the prompt:

```txt
__WEAR_PROMPT__
__WEAR_NEGATIVE_PROMPT__
__WEAR_PERSON_IMAGE__
__WEAR_GARMENT_IMAGE__
__WEAR_GARMENT_IMAGE_1__
__WEAR_GARMENT_IMAGE_2__
__WEAR_GARMENT_IMAGE_3__
__WEAR_GARMENT_IMAGE_4__
```

For virtual try-on, map `__WEAR_PERSON_IMAGE__` to the person/reference image input node and `__WEAR_GARMENT_IMAGE_1__` to the garment input node. The current onboarding stores face references; a future full-body reference step will make try-on workflows much more reliable.

## Provider Auto Mode

```env
IMAGE_PROVIDER=auto
```

Auto mode tries ComfyUI first, then LocalAI, then the built-in collage fallback.

## Licensing Note

ComfyUI, LocalAI, and stable-diffusion.cpp are free local tools. Some try-on workflows/models such as CatVTON and IDM-VTON may be free to run but non-commercial. Treat those as prototype/local-dev options until launch licensing is confirmed.
