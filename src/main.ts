import { createApp } from 'vue';
import App from './App.vue';

function bootstrap() {
  const host = document.createElement('div');
  host.id = 'academic-zhihu-root';
  document.body.appendChild(host);

  createApp(App).mount(host);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}
