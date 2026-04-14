async function run() {
  const res = await fetch('https://www.verisure.es/');
  const text = await res.text();
  const lines = text.split('\n').filter(l => l.match(/favicon|logo|icon/i)).slice(0, 20);
  console.log(lines.join('\n'));
}
run();
