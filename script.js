function showNotification(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.backgroundColor = '#333';
  notif.style.color = '#fff';
  notif.style.padding = '10px 20px';
  notif.style.borderRadius = '5px';
  notif.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  notif.style.zIndex = '10000';
  notif.style.opacity = '0';
  notif.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(notif);

  requestAnimationFrame(() => {
    notif.style.opacity = '1';
  });

  setTimeout(() => {
    notif.style.opacity = '0';
    notif.addEventListener('transitionend', () => {
      notif.remove();
    });
  }, 3000);
}

// Firebase الإعدادات
const firebaseConfig = {
  apiKey: "AIzaSyDqJSfTPVe-Y6zSjZyBA39ANYC97JNcz8o",
  authDomain: "aimagix-8c704.firebaseapp.com",
  projectId: "aimagix-8c704",
  storageBucket: "aimagix-8c704.appspot.com",
  messagingSenderId: "898141910343",
  appId: "1:898141910343:web:9d7d94be44380d63c18862"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const authIcon = document.getElementById('authIcon');

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

authIcon.onclick = () => {
  document.getElementById('authModal').classList.remove('hidden');
};
document.getElementById('closeAuth').onclick = () => {
  document.getElementById('authModal').classList.add('hidden');
};

document.getElementById('loginBtn').onclick = () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showNotification("تم تسجيل الدخول بنجاح");
      document.getElementById('authModal').classList.add('hidden');
    })
    .catch(() => showNotification("البريد الإلكتروني أو كلمة المرور غير صحيحة"));
};

document.getElementById('registerBtn').onclick = () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  if (!email.includes('@gmail.com')) {
    showNotification('يجب أن يحتوي البريد الإلكتروني على @gmail.com');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      showNotification("تم إنشاء الحساب بنجاح");
      document.getElementById('authModal').classList.add('hidden');
    })
    .catch(err => showNotification("حدث خطأ أثناء إنشاء الحساب: " + err.message));
};

document.getElementById('addImageBtn').onclick = async () => {
  const file = document.getElementById('imageUpload').files[0];
  const name = document.getElementById('imageNameInput').value.trim();

  if (!file || !name) {
    showNotification('يرجى اختيار صورة وكتابة اسم للصورة');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'AImagix');

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/dwalfzmb0/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error.message);

    await db.collection('images').add({
      name,
      url: data.secure_url,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    showNotification("تم رفع الصورة بنجاح");
    document.getElementById('imageUpload').value = '';
    document.getElementById('imageNameInput').value = '';
    loadImages();
  } catch (err) {
    showNotification("حدث خطأ أثناء رفع الصورة: " + err.message);
  }
};

async function deleteImage(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
  try {
    await db.collection('images').doc(id).delete();
    showNotification('تم حذف الصورة بنجاح');
    loadImages();
  } catch (err) {
    showNotification('حدث خطأ أثناء الحذف: ' + err.message);
  }
}

async function renameImage(id, oldName) {
  const newName = prompt('أدخل الاسم الجديد للصورة:', oldName);
  if (newName && newName.trim() !== '') {
    try {
      await db.collection('images').doc(id).update({
        name: newName.trim()
      });
      showNotification('تم تغيير اسم الصورة بنجاح');
      loadImages();
    } catch (err) {
      showNotification('حدث خطأ أثناء تغيير الاسم: ' + err.message);
    }
  }
}

// دالة تحميل الصورة
function downloadImage(url, name) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.blob();
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      showNotification('✅ تم تحميل الصورة بنجاح');
    })
    .catch(() => showNotification('❌ فشل تحميل الصورة'));
}


let allImages = [];

async function loadImages(filter = '') {
  const grid = document.getElementById('imageGrid');
  grid.innerHTML = '';

  const user = auth.currentUser;
  const isAdmin = user && user.email === "laithqr53@gmail.com";

  const snapshot = await db.collection('images').orderBy('timestamp', 'desc').get();

  allImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const filteredImages = allImages.filter(img => img.name.toLowerCase().includes(filter.toLowerCase()));

  filteredImages.forEach(data => {
    const card = document.createElement('div');
    card.className = 'image-card';

    card.innerHTML = `
      <img src="${data.url}" alt="${data.name}" />
      <div class="image-name">${data.name}</div>
      <div class="controls">
        <a href="#" 
           ${!user ? 'onclick="showNotification(\'يرجى تسجيل الدخول لتحميل الصور\'); return false;" class="download-btn disabled" aria-disabled="true"' : `onclick="downloadImage('${data.url}', '${data.name}'); return false;" class="download-btn"`}>
           Download
        </a>
        ${isAdmin ? `
          <button class="delete-btn" onclick="deleteImage('${data.id}')">Delete</button>
          <button class="rename-btn" onclick="renameImage('${data.id}', '${data.name}')">Rename</button>
        ` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  loadImages(query);
});

auth.onAuthStateChanged(user => {
  const isAdmin = user && user.email === "laithqr53@gmail.com";
  document.getElementById('adminControls').style.display = isAdmin ? "block" : "none";

  loadImages();

  if (user) {
    authIcon.innerText = 'Logout';
    authIcon.onclick = () => {
      auth.signOut().then(() => {
        showNotification('تم تسجيل الخروج');
      });
    };
  } else {
    authIcon.innerText = '🔐';
    authIcon.onclick = () => {
      document.getElementById('authModal').classList.remove('hidden');
    };
  }
});
