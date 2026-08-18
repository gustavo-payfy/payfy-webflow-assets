# payfy-webflow-assets

Assets estáticos (JS/CSS) servidos via jsDelivr pros custom code embeds do site Payfy no Webflow.

## Estrutura
- `runtime/` — support.js (runtime do Claude Design, não editar), home-fx.js, image-slot.js
- `css/` — payfy-anim.css

## Uso
Referenciado no Webflow via <script src="https://cdn.jsdelivr.net/gh/gustavo-payfy/payfy-webflow-assets@main/runtime/support.js"></script>

Depois de qualquer alteração em home-fx.js ou payfy-anim.css, fazer purge no jsDelivr:
https://www.jsdelivr.com/tools/purge