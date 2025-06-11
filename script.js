function showLanguage(langPrefix) {
  const allPrefixes = ['Arabic', 'English', 'Deutsch'];
  allPrefixes.forEach(prefix => {
    const main = document.getElementById(prefix);
    const sub = document.getElementById(prefix + '-1');
    
    if (main) main.style.display = (prefix === langPrefix) ? 'block' : 'none';
    if (sub) sub.style.display = (prefix === langPrefix) ? 'block' : 'none';
  });
}

  
const buttons = document.querySelectorAll('.backBtn');
const message = document.getElementById('message');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // تعيين مكان الرسالة بالقرب من الزر اللي ضغط عليه
    const rect = button.getBoundingClientRect();
    message.style.top = (window.scrollY + rect.bottom + 5) + 'px';
    message.style.left = (window.scrollX + rect.left) + 'px';

    // عرض الرسالة
    message.classList.add('show');

    // اخفاء الرسالة بعد 2.5 ثانية
    setTimeout(() => {
      message.classList.remove('show');
    }, 2500);
  });
});