const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

for (const [file, renderers] of [
  ['tools/port-container-tracker/app.js', ['renderThroughputChart', 'renderOccupancyChart', 'renderTurnaroundChart']],
  ['tools/port-container-tracker/frontend/app.js', ['renderThroughputChart', 'renderOccupancyChart', 'renderTurnaroundChart']],
  ['tools/csp-toolkit/vbs-analytics/index.html', ['drawBookingChart', 'drawStatusChart', 'drawGateTimeChart', 'drawCarrierChart', 'drawWeeklyChart']],
]) {
  test(`${file}: re-render replaces existing charts`, () => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const code = file.endsWith('.html')
      ? [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
      : source;
    const canvases = new Map();
    const instances = [];
    const context = vm.createContext({
      document: {
        addEventListener() {},
        getElementById(id) {
          if (!canvases.has(id)) {
            const canvas = { id, getContext() { return this; } };
            canvases.set(id, canvas);
          }
          return canvases.get(id);
        },
      },
      Chart: class {
        constructor(canvas, config) {
          assert.ok(config.type);
          this.canvas = canvas;
          this.destroyed = false;
          instances.push(this);
        }
        destroy() { this.destroyed = true; }
      },
    });
    vm.runInContext(code, context);
    for (const renderer of renderers) {
      vm.runInContext(`${renderer}(); ${renderer}();`, context);
    }
    assert.equal(instances.length, renderers.length * 2);
    for (let index = 0; index < instances.length; index += 2) {
      assert.equal(instances[index].destroyed, true);
      assert.equal(instances[index + 1].destroyed, false);
      assert.equal(instances[index].canvas, instances[index + 1].canvas);
    }
  });
}
