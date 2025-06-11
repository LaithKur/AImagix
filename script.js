function showLanguage(langId) {
    const sections = ['Arabic', 'English', 'Deutsch'];
    sections.forEach(id => {
      document.getElementById(id).style.display = (id === langId) ? 'block' : 'none';
    });
  }
  function showLanguage1(langId) {
    const sections = ['Arabic-1', 'English-1', 'Deutsch-1'];
    sections.forEach(id => {
      document.getElementById(id).style.display = (id === langId) ? 'block' : 'none';
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