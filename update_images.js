
const mysql = require('mysql2/promise');

// Model-specific images using source.unsplash.com (keyless, dynamic)
const modelImages = {
  'Toyota Corolla Altis': [
    'https://source.unsplash.com/800x600/?toyota-corolla-altis,front-car',
    'https://source.unsplash.com/800x600/?toyota-corolla-altis,side-car',
    'https://source.unsplash.com/800x600/?toyota-corolla-altis,rear-car',
    'https://source.unsplash.com/800x600/?toyota-corolla-altis,interior-car',
    'https://source.unsplash.com/800x600/?toyota-corolla-altis,engine-car'
  ],
  'Toyota Allion / Premio': [
    'https://source.unsplash.com/800x600/?toyota-allion-premio,front-car',
    'https://source.unsplash.com/800x600/?toyota-allion-premio,side-car',
    'https://source.unsplash.com/800x600/?toyota-allion-premio,rear-car',
    'https://source.unsplash.com/800x600/?toyota-allion-premio,interior-car',
    'https://source.unsplash.com/800x600/?toyota-allion-premio,engine-car'
  ],
  'Honda City': [
    'https://source.unsplash.com/800x600/?honda-city,front-car',
    'https://source.unsplash.com/800x600/?honda-city,side-car',
    'https://source.unsplash.com/800x600/?honda-city,rear-car',
    'https://source.unsplash.com/800x600/?honda-city,interior-car',
    'https://source.unsplash.com/800x600/?honda-city,engine-car'
  ],
  'Honda Civic': [
    'https://source.unsplash.com/800x600/?honda-civic,front-car',
    'https://source.unsplash.com/800x600/?honda-civic,side-car',
    'https://source.unsplash.com/800x600/?honda-civic,rear-car',
    'https://source.unsplash.com/800x600/?honda-civic,interior-car',
    'https://source.unsplash.com/800x600/?honda-civic,engine-car'
  ],
  'Hyundai Creta': [
    'https://source.unsplash.com/800x600/?hyundai-creta,front-car',
    'https://source.unsplash.com/800x600/?hyundai-creta,side-car',
    'https://source.unsplash.com/800x600/?hyundai-creta,rear-car',
    'https://source.unsplash.com/800x600/?hyundai-creta,interior-car',
    'https://source.unsplash.com/800x600/?hyundai-creta,engine-car'
  ],
  'Kia Sonet': [
    'https://source.unsplash.com/800x600/?kia-sonet,front-car',
    'https://source.unsplash.com/800x600/?kia-sonet,side-car',
    'https://source.unsplash.com/800x600/?kia-sonet,rear-car',
    'https://source.unsplash.com/800x600/?kia-sonet,interior-car',
    'https://source.unsplash.com/800x600/?kia-sonet,engine-car'
  ],
  'Mitsubishi Xpander': [
    'https://source.unsplash.com/800x600/?mitsubishi-xpander,front-car',
    'https://source.unsplash.com/800x600/?mitsubishi-xpander,side-car',
    'https://source.unsplash.com/800x600/?mitsubishi-xpander,rear-car',
    'https://source.unsplash.com/800x600/?mitsubishi-xpander,interior-car',
    'https://source.unsplash.com/800x600/?mitsubishi-xpander,engine-car'
  ],
  'Nissan Sylphy': [
    'https://source.unsplash.com/800x600/?nissan-sylphy,front-car',
    'https://source.unsplash.com/800x600/?nissan-sylphy,side-car',
    'https://source.unsplash.com/800x600/?nissan-sylphy,rear-car',
    'https://source.unsplash.com/800x600/?nissan-sylphy,interior-car',
    'https://source.unsplash.com/800x600/?nissan-sylphy,