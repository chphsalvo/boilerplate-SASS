import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import { watch } from 'fs';

const distCssMin = 'css/style.min.css';
const distCss = 'css/style.css';
const isWatch = process.argv.includes('--watch');

function createBuildOptions(outfile, minify) {
  return {
    entryPoints: ['sass/style.scss'],
    bundle: true,
    outfile,
    minify,
    sourcemap: true,
    plugins: [sassPlugin()]
  };
}

async function applyPostCSS(file) {
  const css = await fs.readFile(file, 'utf8');
  const result = await postcss([autoprefixer]).process(css, {
    from: undefined,
    to: file,
    map: { inline: false }
  });

  await fs.writeFile(file, result.css);
  if (result.map) {
    await fs.writeFile(`${file}.map`, result.map.toString());
  }
}

async function buildAndPrefix() {
  console.time('🛠️  Tempo build totale');

  try {
    await Promise.all([
      esbuild.build(createBuildOptions(distCssMin, true)),
      esbuild.build(createBuildOptions(distCss, false))
    ]);

    await Promise.all([
      applyPostCSS(distCss),
      applyPostCSS(distCssMin)
    ]);

    console.log('✅ Build completata');
  } catch (err) {
    console.error('❌ Errore nella build:', err.message);
  }

  console.timeEnd('🛠️  Tempo build totale');
}

if (isWatch) {
  console.log('👀 Watch attivo...');
  watch('sass', { recursive: true }, async (eventType, filename) => {
    if (filename?.endsWith('.scss')) {
      console.log(`📦 Modifica rilevata in: ${filename}`);
      await buildAndPrefix();
    }
  });

  await buildAndPrefix();
  await new Promise(() => { }); // mantiene attivo il processo
} else {
  await buildAndPrefix();
}