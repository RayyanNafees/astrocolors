const primaryButtons = document.querySelectorAll('.primary-button');
const secondaryButtons = document.querySelectorAll('.secondary-button');
const partTwo = document.querySelectorAll('.part2');
const primbuttnColorClass = document.querySelector('.primbuttn');
const secbuttnColorClass = document.querySelector('.secbuttn');
const accentColorClass = document.querySelector('.accent');
const primColorClass = document.querySelector('.prim');
const secColorClass = document.querySelector('.sec');
const primaryColor = document.getElementById('prim');
const secondaryColor = document.getElementById('sec');
const primbuttnColor = document.getElementById('primbuttn');
const secbuttnColor = document.getElementById('secbuttn');
const accentColor = document.getElementById('accent');
const randomizeButton = document.getElementById('randomize');
const colorPickers = document.querySelectorAll('.colorpicker');
const hexInputs = document.querySelectorAll('.hex-input');
const hueRotationInputs = document.querySelectorAll('.hue-rotation');
const hueUnderlays = document.querySelectorAll('.color-underlay');


// FAQ

const faqQuestions = document.querySelectorAll<HTMLElement>(".faq");
const faqAnswers = document.querySelectorAll(".faq-a");
const faqIcons = document.querySelectorAll(".faq-icon");


faqQuestions.forEach((faqQuestion, index) => {
  faqQuestion.addEventListener('click', () => {
    // Close all other questions
    faqQuestions.forEach((question, i) => {
      if (i !== index) {
        faqIcons[i].classList.remove("expand");
        question.classList.remove("expand");
        faqAnswers[i].classList.remove("expand");
      }
    });

    // Toggle the clicked question
    faqIcons[index].classList.toggle("expand");
    faqQuestions[index].classList.toggle("expand");
    faqAnswers[index].classList.toggle("expand");
  });
});



export function highlightToolbar() {
  var toolbar = document.getElementById("toolbar")!;
  toolbar.classList.add("highlighted");
  setTimeout(function() {
    toolbar.classList.remove("highlighted");
  }, 1000);
}


const contrastInfoLink = document.querySelectorAll('.contrast-link');
const contrastAnswer = document.querySelector('.contrast-answer')!;
const contrastFAQIcon = document.querySelector('.contrast-icon')!;

function expandContrastInfo() {
contrastAnswer.classList.add("expand");
contrastFAQIcon.classList.add("expand");
}

contrastInfoLink.forEach((link) => {
link.addEventListener("click", expandContrastInfo);
});


// TIP

const tipBar = document.getElementById('tip-bar')!;
const closeBtn = document.getElementById('close-btn')!;
const randomizeBtn = document.getElementById('randomize');

function showTipBar() {
  tipBar.classList.add('show');
}

function hideTipBar() {
  tipBar.classList.remove('show');
}

closeBtn.addEventListener('click', hideTipBar);

randomizeBtn?.addEventListener('click', function(event) {
  if (!localStorage.getItem('tipShown')) {
    setTimeout(showTipBar, 2000);
    localStorage.setItem('tipShown', 'true');
  }
});

if (localStorage.getItem('tipShown')) {
  tipBar.style.display = 'none';
}





// hamburger menu 

if (window.innerWidth < 1100) {
    const hamburger = document.querySelector('#hamburger')!;
    const mobileMenu = document.querySelector('.menu')!;
  
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('hide')
    });
}





// SHARE
const shareButtonTooltip = document.querySelector('.tooltip-share')!;

function copyPageUrl() {
    const pageUrl = window.location.href;
  
    navigator.clipboard.writeText(pageUrl);
  
    const shareButton = document.querySelector('.share-link-buttn')!;
    const shareButtonTooltip = document.querySelector('.tooltip-share')!;
    shareButton.textContent = 'Copied!';
    shareButton.classList.add('copied');

    shareButtonTooltip.textContent = 'Copied!';
    shareButtonTooltip.classList.add('copied');
  
    setTimeout(function() {
      shareButton.textContent = 'Share Link';
      shareButton.classList.remove('copied');

      shareButtonTooltip.innerHTML = 'Share Link<br><span class="controls-tooltip">(CTRL + S)</span>';
      shareButtonTooltip.classList.remove('copied');
    }, 2000);
  }
  

  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      copyPageUrl();
      shareButtonTooltip.classList.add('hover');

      setTimeout(function() {
        shareButtonTooltip.classList.remove('hover');
      }, 2000);
    }
});
 
  






var activeTabIndex = 0;

document.getElementById("export")?.addEventListener("click", function() {
    document.getElementById("overlay")!.style.display = "block";
    document.getElementById("popup")!.style.display = "flex";
    document.querySelector<HTMLElement>("export-options")!.style.display = "block";
    
    var tabs = document.querySelectorAll<HTMLElement>(".tab");
    var activeTab = tabs[activeTabIndex];
    moveLine(activeTab, activeTabIndex);
});
  
document.getElementById("overlay")?.addEventListener("click", function() {
    document.getElementById("overlay")!.style.display = "none";
    document.getElementById("popup")!.style.display = "none";
    document.querySelector<HTMLElement>("export-options")!.style.display = "none";
});

const fontRollout = document.querySelector(".fonts-rollout");

fontRollout?.addEventListener("click", () => {
  document.getElementById("overlay")!.style.display = "none";
  document.getElementById("popup")!.style.display = "none";
  document.querySelector<HTMLElement>("export-options")!.style.display = "none";
});
  
var tabs = document.querySelectorAll<HTMLElement>(".tab");
var tabContents = document.querySelectorAll(".tabContent");
var line = document.querySelector<HTMLElement>(".line")!;
  
tabs?.forEach(function(tab, index) {
    tab?.addEventListener("click", () => {
      var tabId = tab.getAttribute("data-tab")!;
      activateTab(tabId);
      moveLine(tab, index);
    });
});
  
function activateTab(tabId: string) {
    tabs.forEach(function(tab) {
      tab.classList.remove("active");
    });
  
    tabContents.forEach(function(content) {
      content.classList.remove("active");
    });
  
    document.querySelector(".tab[data-tab='" + tabId + "']")!.classList.add("active");
    document.getElementById(tabId)!.classList.add("active");
}
  
function moveLine(tab: HTMLElement, index: number) {
    var tabPosition = tab.offsetLeft;
    var tabWidth = tab.offsetWidth;
    line.style.setProperty("--tab-position", tabPosition + "px");
    line.style.setProperty("--tab-width", tabWidth + "px");
    line.classList.add("active");
    
    activeTabIndex = index;
}
  
  
  
  





var fontTypeInputs = document.querySelectorAll('.font-type-input');
var enterIcons = document.querySelectorAll<HTMLElement>('.enter-icon')!;

function handleInputChange(e: Event) {
  var fontTypeInput = e.target as HTMLInputElement
  var enterIcon = enterIcons[Array.from(fontTypeInputs).indexOf(fontTypeInput)];

  if (fontTypeInput.value) {
    enterIcon.style.opacity = '1';
  } else {
    enterIcon.style.opacity = '0.3';
  }
}

for (var i = 0; i < fontTypeInputs.length; i++) {
  fontTypeInputs[i].addEventListener('input', handleInputChange);
  fontTypeInputs[i].addEventListener('change', handleInputChange);
}


export {faqQuestions};






// window.addEventListener('resize', function () { 
//   "use strict";
//   window.location.reload(); 
// });

