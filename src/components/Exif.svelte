<script lang="ts">
  export let fNumber: number;
  export let exposureTime: number;
  export let iso: number;
  export let focalLength: number;
  export let lens: string | null = null;
  export let camera: string;

  function formatCamera(camera: string, lens?: string | null) {
    const replacements: Record<string, string> = {
      'RICOH GR III': 'GRIII',
      'DMC-GX80': 'GX80',
    };

    let result = replacements[camera] || camera;
    if (lens) {
      result += ` (${lens})`;
    }

    return result;
  }

  function formatExposure(exposureTime: number): string {
    if (exposureTime < 1) {
      return `1/${1 / exposureTime}`;
    } else {
      return String(exposureTime);
    }
  }
</script>

<div class="exif">
  <div class="model" title={formatCamera(camera, lens)}>
    {formatCamera(camera)}
  </div>
  <div class="focal-length">{focalLength}</div>
  <div class="exposure">{formatExposure(exposureTime)}</div>
  <div class="fstop">{fNumber}</div>
  <div class="iso">{iso}</div>
</div>

<style>
  .exif {
    font-size: 14px;
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .exposure::after {
    content: 's';
  }

  .fstop::before {
    content: 'f';
    font-style: italic;
    margin-right: 2px;
  }

  .iso::before {
    content: 'ISO ';
  }

  .focal-length::after {
    content: 'mm';
  }
</style>
