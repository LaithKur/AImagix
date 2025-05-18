// Firebase إعداد
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqJSfTPVe-Y6zSjZyBA39ANYC97JNcz8o",
  authDomain: "aimagix-8c704.firebaseapp.com",
  projectId: "aimagix-8c704",
  storageBucket: "aimagix-8c704.appspot.com",
  messagingSenderId: "898141910343",
  appId: "1:898141910343:web:9d7d94be44380d63c18862",
  measurementId: "G-08RGJ7KZVK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// عناصر HTML
const loginIcon = document.getElementById("loginIcon");
const authSection = document.getElementById("authSection");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminSection = document.getElementById("adminSection");
const imageInput = document.getElementById("imageInput");
const imageNameInput = document.getElementById("imageName");
const uploadBtn = document.getElementById("uploadBtn");
const imageGrid = document.getElementById("imageGrid");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const toggleMode = document.getElementById("toggleMode");

let currentUser = null;

// الوضع الليلي
toggleMode.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// عرض نافذة تسجيل الدخول
loginIcon.addEventListener("click", () => {
  authSection.style.display = authSection.style.display === "none" ? "block" : "none";
});

// تسجيل الدخول
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      authSection.style.display = "none";
    })
    .catch(error => alert("فشل تسجيل الدخول: " + error.message));
});

// تسجيل الخروج
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// متابعة حالة تسجيل الدخول
onAuthStateChanged(auth, user => {
  currentUser = user;
  adminSection.style.display = user ? "block" : "none";
  logoutBtn.style.display = user ? "block" : "none";
  renderImages();
});

// رفع صورة
uploadBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  const name = imageNameInput.value.trim() || "Untitled";
  if (!file) return alert("اختر صورة!");
  const storageRef = ref(storage, `images/${Date.now()}_${name}`);
  uploadBytes(storageRef, file)
    .then(() => {
      renderImages();
      imageInput.value = "";
      imageNameInput.value = "";
    });
});

// عرض الصور
function renderImages() {
  imageGrid.innerHTML = "";
  const storageRef = ref(storage, "images");
  listAll(storageRef).then(result => {
    result.items.reverse().forEach(item => {
      getDownloadURL(item).then(url => {
        const name = item.name.split("_").slice(1).join("_");

        const card = document.createElement("div");
        card.className = "image-card";

        const img = document.createElement("img");
        img.src = url;
        img.alt = name;
        img.onclick = () => {
          modal.style.display = "flex";
          modalImg.src = url;
        };

        const actions = document.createElement("div");
        actions.className = "image-actions";

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "تحميل";
        downloadBtn.onclick = () => window.open(url, "_blank");

        actions.appendChild(downloadBtn);

        if (currentUser) {
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "حذف";
          deleteBtn.onclick = () => {
            deleteObject(item).then(renderImages);
          };

          const renameBtn = document.createElement("button");
          renameBtn.textContent = "تغيير الاسم";
          renameBtn.onclick = () => {
            const newName = prompt("الاسم الجديد:", name);
            if (!newName) return;
            getDownloadURL(item).then(url => {
              fetch(url).then(res => res.blob()).then(blob => {
                const newRef = ref(storage, `images/${Date.now()}_${newName}`);
                uploadBytes(newRef, blob).then(() => {
                  deleteObject(item).then(renderImages);
                });
              });
            });
          };

          actions.appendChild(deleteBtn);
          actions.appendChild(renameBtn);
        }

        card.appendChild(img);
        card.appendChild(actions);
        imageGrid.appendChild(card);
      });
    });
  });
}

// إغلاق نافذة تكبير الصورة
modalClose.onclick = () => {
  modal.style.display = "none";
};
