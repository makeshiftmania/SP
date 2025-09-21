// ppdoc-level-switcher.js — waits for fragments
(function(){
  document.addEventListener('smartui:fragmentsReady',init,{once:true});
  function init(){
    const WRAP=document.getElementById('Smart_Menu_Bar');
    if(!WRAP) return;
    const levels=[{value:'html',label:'Standard'},{value:'bronze',label:'Bronze'},{value:'silver',label:'Silver'},{value:'gold',label:'Gold'}];
    dropdownCore.populate(WRAP,levels,folder=>{
      const u=new URL(location.href);
      const parts=u.pathname.split('/');
      parts[1]=folder;
      u.pathname=parts.join('/');
      location.href=u.toString();
    });
  }
})();