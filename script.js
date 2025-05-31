let currentDeviceFilter = 'all';  // فلتر الجهاز الافتراضي

// دالة عرض الإشعارات (موجودة كما هي)
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

// Firebase الإعدادات (كما هي)
const firebaseConfig = {
  apiKey: "AIzaSyDqJSfTPVe-Y6zSjZyBA39ANYC97JNcz8o",
  authDomain: "aimagix-8c704.firebaseapp.com",
  databaseURL: "https://aimagix-8c704-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aimagix-8c704",
  storageBucket: "aimagix-8c704.firebasestorage.app",
  messagingSenderId: "898141910343",
  appId: "1:898141910343:web:9d7d94be44380d63c18862",
  measurementId: "G-08RGJ7KZVK"
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
    .then((userCredential) => {
      const user = userCredential.user;

      if (user.emailVerified) {
        showNotification("✅ تم تسجيل الدخول بنجاح");
      } else {
        auth.signOut();
        showNotification("⚠️ لم يتم تأكيد البريد الإلكتروني. تم تسجيل الخروج.");
      }

      localStorage.setItem('authModalClosed', 'true');
setTimeout(() => {
  location.reload();
}, 1000);

    })
    .catch(() => {
      showNotification("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setTimeout(() => {
        location.reload();
      }, 2500);
    });
};



// تعريف مزود جوجل
const provider = new firebase.auth.GoogleAuthProvider();

// حدث تسجيل الدخول بجوجل
document.getElementById('googleLoginBtn').onclick = () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      showNotification(`تم تسجيل الدخول كمستخدم: ${result.user.email}`);
      document.getElementById('authModal').classList.add('hidden');
    })
    .catch((error) => {
      showNotification(`حدث خطأ أثناء تسجيل الدخول بجوجل: ${error.message}`);
    });
};


document.getElementById('registerBtn').onclick = () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  if (!email.includes('@gmail.com')) {
    showNotification('يجب أن يحتوي البريد الإلكتروني على @gmail.com');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      user.sendEmailVerification()
        .then(() => {
          showNotification("✅ تم إرسال رسالة تحقق إلى بريدك. لديك 5 دقائق للتأكيد.");
          
          // بدء مؤقت حذف بعد 5 دقائق إذا لم يتم تأكيد البريد
          setTimeout(() => {
            user.reload().then(() => {
              if (!user.emailVerified) {
                user.delete().then(() => {
                  console.log("تم حذف الحساب لعدم تأكيد البريد خلال 5 دقائق.");
                });
              }
            });
          }, 5 * 60 * 1000);

          auth.signOut(); // طرده مؤقتًا حتى يؤكد
        })
        .catch((error) => {
          showNotification("❌ خطأ في إرسال رسالة التحقق: " + error.message);
        });

      // تحديث الصفحة فورًا
      setTimeout(() => {
        location.reload();
      }, 1000);
    })
    .catch((err) => {
      if (err.code === 'auth/email-already-in-use') {
        showNotification("❌ هذا الإيميل موجود بالفعل");
      } else {
        showNotification("❌ حدث خطأ أثناء إنشاء الحساب: " + err.message);
      }
      

     localStorage.setItem('authModalClosed', 'true');
setTimeout(() => {
  location.reload();
}, 2500);

    });
};






document.getElementById('addImageBtn').onclick = async () => {
  const file = document.getElementById('imageUpload').files[0];
  const name = document.getElementById('imageNameInput').value.trim();
  const device = document.getElementById('deviceSelect').value;

  if (!file || !name || !device) {
    showNotification('يرجى اختيار صورة وكتابة اسم للصورة واختيار الجهاز');
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
      device,  // حفظ نوع الجهاز مع الصورة
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    showNotification("تم رفع الصورة بنجاح");
    document.getElementById('imageUpload').value = '';
    document.getElementById('imageNameInput').value = '';
    document.getElementById('deviceSelect').value = 'all';
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

// تكبير الصورة عند النقر
  document.addEventListener("click", function (e) {
    const target = e.target;

    // إذا ضغط المستخدم على صورة داخل الشبكة
    if (target.tagName === "IMG" && target.closest("#imageGrid")) {
      const modal = document.getElementById("imageModal");
      const modalImg = document.getElementById("modalImage");
      modalImg.src = target.src;
      modal.classList.remove("hidden");
    }

    // إذا ضغط على أي مكان أثناء عرض الصورة المكبرة
    const modal = document.getElementById("imageModal");
    if (!modal.classList.contains("hidden") && (target.id === "imageModal" || target.id === "modalImage")) {
      modal.classList.add("hidden");
    }
  });



let allImages = [];

let currentPage = 1;
const imagesPerPage = 27;
let filteredImages = [];

async function loadImages(filter = '') {
  const grid = document.getElementById('imageGrid');
  grid.innerHTML = '';

  const user = auth.currentUser;
  const isAdmin = user && user.email === "laithqr53@gmail.com";

  const snapshot = await db.collection('images').orderBy('timestamp', 'desc').get();

  allImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // فلترة حسب الاسم والجهاز
  filteredImages = allImages.filter(img => {
    const matchName = img.name.toLowerCase().includes(filter.toLowerCase());
    const matchDevice = currentDeviceFilter === 'all' || (img.device && img.device === currentDeviceFilter);
    return matchName && matchDevice;
  });

  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const imagesToDisplay = filteredImages.slice(startIndex, endIndex);

  imagesToDisplay.forEach(data => {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const ratings = data.ratings || {};
    const ratingValues = Object.values(ratings);
    const ratingCount = ratingValues.length;
    const totalRating = ratingValues.reduce((a, b) => a + b, 0);
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'لا يوجد';
    const userRating = user && ratings[user.uid] ? ratings[user.uid] : 0;

    function createStars() {
      return [1, 2, 3, 4, 5].map(star => {
        const isActive = userRating >= star;
        return `<span 
          class="star${isActive ? ' active' : ''}" 
          data-id="${data.id}" 
          data-star="${star}" 
          title="تقييم ${star} نجوم"
          style="cursor: ${user ? 'pointer' : 'not-allowed'}"
        >★</span>`;
      }).join('');
    }

    card.innerHTML = `
      <img src="${data.url}" alt="${data.name}" />
      <div class="image-name">${data.name}</div>
      <div class="image-device">الجهاز: ${data.device || 'غير محدد'}</div>
      <div class="image-rating">
        <span>⭐ التقييم:</span>
        ${createStars()}
        <div class="average-rating">متوسط التقييم: ${averageRating}</div>
      </div>
      <div class="controls">
        <a href="#"
           ${!user
             ? 'onclick="showNotification(\'يرجى تسجيل الدخول لتحميل الصور\'); return false;" class="download-btn disabled" aria-disabled="true"'
             : `onclick="downloadImage('${data.url}', '${data.name}'); return false;" class="download-btn"`}
        >Download ⬇️</a>
        ${isAdmin ? `
          <button class="delete-btn" onclick="deleteImage('${data.id}')">Delete 🗑️</button>
          <button class="rename-btn" onclick="renameImage('${data.id}', '${data.name}')">Rename ✏️</button>
        ` : ''}
      </div>
    `;

    function updateStars(newRating) {
      card.querySelectorAll('.star').forEach(starEl => {
        const starValue = parseInt(starEl.getAttribute('data-star'), 10);
        starEl.classList.toggle('active', starValue <= newRating);
      });

      const updatedRatings = { ...ratings, [user.uid]: newRating };
      const values = Object.values(updatedRatings);
      const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'لا يوجد';
      card.querySelector('.average-rating').textContent = `متوسط التقييم: ${avg}`;
    }

    if (user) {
      card.querySelectorAll('.star').forEach(starEl => {
        starEl.addEventListener('click', async () => {
          const imgId = starEl.getAttribute('data-id');
          const rating = parseInt(starEl.getAttribute('data-star'), 10);

          try {
            const imgRef = db.collection('images').doc(imgId);
            const imgDoc = await imgRef.get();
            if (!imgDoc.exists) throw new Error("الصورة غير موجودة");

            const imgData = imgDoc.data();
            const currentRatings = imgData.ratings || {};
            const newRatings = { ...currentRatings, [user.uid]: rating };

            await imgRef.update({ ratings: newRatings });

            showNotification('✅ تم حفظ التقييم');
            updateStars(rating);
          } catch (err) {
            console.error(err);
            showNotification('❌ حدث خطأ أثناء حفظ التقييم');
          }
        });
      });
    }

    grid.appendChild(card);
  });

  // ======= أزرار التنقل بين الصفحات =======
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  if (totalPages > 1) {
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '⬅️ السابق';
      prevBtn.onclick = () => {
        currentPage--;
        loadImages(filter);
      };
      pagination.appendChild(prevBtn);
    }

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `الصفحة ${currentPage} من ${totalPages}`;
    pagination.appendChild(pageIndicator);

    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'التالي ➡️';
      nextBtn.onclick = () => {
        currentPage++;
        loadImages(filter);
      };
      pagination.appendChild(nextBtn);
    }
  }
}



document.getElementById('deviceFilter').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    currentDeviceFilter = e.target.getAttribute('data-device');

    // إزالة التفعيل من جميع الأزرار ثم تفعيل الزر الحالي
    document.querySelectorAll('#deviceFilter button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // إعادة تحميل الصور مع الفلتر الجديد
    loadImages(document.getElementById('searchInput').value.trim());
  }
});


// فلترة حسب البحث النصي (الاسم)
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

if (localStorage.getItem('authModalClosed') === 'true') {
  document.getElementById('authModal').classList.add('hidden');
  localStorage.removeItem('authModalClosed');
}

