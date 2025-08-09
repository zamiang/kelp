import { Environment } from 'vitest';
import { populateGlobal } from 'vitest/environments';

export default <Environment>{
  name: 'jsdom-with-node-polyfills',
  transformMode: 'ssr',
  async setup(global, { jsdom = {} }) {
    // Set up jsdom environment first
    const { JSDOM } = await import('jsdom');
    const { pretendToBeVisual = true, beforeParse = () => {}, ...jsdomOptions } = jsdom;

    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      pretendToBeVisual,
      resources: 'usable',
      runScripts: 'dangerously',
      url: 'http://localhost:3000',
      ...jsdomOptions,
    });

    const { window } = dom;
    const { document } = window;

    // Add Node.js polyfills BEFORE jsdom globals
    const mockProcess = {
      env: { NODE_ENV: 'test' },
      version: 'v18.0.0',
      versions: {
        node: '18.0.0',
        v8: '10.0.0',
        uv: '1.0.0',
        zlib: '1.0.0',
        brotli: '1.0.0',
        ares: '1.0.0',
        modules: '108',
        nghttp2: '1.0.0',
        napi: '8',
        llhttp: '6.0.0',
        openssl: '3.0.0',
        cldr: '41.0',
        icu: '71.1',
        tz: '2022a',
        unicode: '14.0',
      },
      platform: 'linux',
      arch: 'x64',
      pid: 1234,
      ppid: 1233,
      title: 'vitest',
      argv: ['node', 'vitest'],
      argv0: 'node',
      execArgv: [],
      execPath: '/usr/bin/node',
      cwd: () => '/test',
      chdir: () => {},
      umask: () => 0o022,
      uptime: () => 100,
      hrtime: () => [1000, 0],
      memoryUsage: () => ({
        rss: 1000000,
        heapTotal: 1000000,
        heapUsed: 500000,
        external: 100000,
        arrayBuffers: 50000,
      }),
      cpuUsage: () => ({ user: 1000, system: 500 }),
      nextTick: (callback: Function, ...args: any[]) => {
        setImmediate(() => callback(...args));
      },
      exit: () => {},
      abort: () => {},
      kill: () => {},
      getuid: () => 1000,
      getgid: () => 1000,
      geteuid: () => 1000,
      getegid: () => 1000,
      getgroups: () => [1000],
      setuid: () => {},
      setgid: () => {},
      seteuid: () => {},
      setegid: () => {},
      setgroups: () => {},
      // Event emitter methods - these are critical for Vitest's error handling
      listeners: () => [],
      listenerCount: () => 0,
      on: () => {},
      once: () => {},
      off: () => {},
      removeListener: () => {},
      removeAllListeners: () => {},
      emit: () => {},
      addListener: () => {},
      prependListener: () => {},
      prependOnceListener: () => {},
      eventNames: () => [],
      getMaxListeners: () => 10,
      setMaxListeners: () => {},
      rawListeners: () => [],
      // Standard streams
      stdin: {
        readable: true,
        writable: false,
        on: () => {},
        once: () => {},
        emit: () => {},
        read: () => {},
        pipe: () => {},
        unpipe: () => {},
        pause: () => {},
        resume: () => {},
        setEncoding: () => {},
        destroy: () => {},
        isTTY: false,
      },
      stdout: {
        readable: false,
        writable: true,
        on: () => {},
        once: () => {},
        emit: () => {},
        write: () => {},
        end: () => {},
        destroy: () => {},
        isTTY: false,
        columns: 80,
        rows: 24,
      },
      stderr: {
        readable: false,
        writable: true,
        on: () => {},
        once: () => {},
        emit: () => {},
        write: () => {},
        end: () => {},
        destroy: () => {},
        isTTY: false,
        columns: 80,
        rows: 24,
      },
      // Additional properties
      binding: () => {},
      _getActiveHandles: () => [],
      _getActiveRequests: () => [],
      _kill: () => {},
      dlopen: () => {},
      reallyExit: () => {},
      _debugProcess: () => {},
      _debugEnd: () => {},
      _startProfilerIdleNotifier: () => {},
      _stopProfilerIdleNotifier: () => {},
      moduleLoadList: [],
      report: {
        writeReport: () => {},
        getReport: () => ({}),
      },
    };

    // Set up Node.js globals first
    global.process = mockProcess;
    global.global = global;
    global.Buffer = Buffer;

    // Set up jsdom globals
    beforeParse(window);

    // Populate global with jsdom properties
    populateGlobal(global, window, { bindFunctions: true });

    // Override specific globals that might conflict
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
    global.location = window.location;

    return {
      teardown() {
        dom.window.close();
      },
    };
  },
};
