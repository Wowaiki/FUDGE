(function framework7ComponentLoader(e,t){void 0===t&&(t=!0);var r=document,a=(window,e.$),i=(e.Template7,e.utils),s=e.device,n=(e.support,e.Class),o=(e.Modal,e.ConstructorMethods),l=(e.ModalMethods,function(e){function t(t,n){void 0===n&&(n={}),e.call(this,n,[t]);var o,l=this;"md"===t.theme?o=48:"ios"===t.theme?o=44:"aurora"===t.theme&&(o=38);var p={cols:1,height:o,cache:!0,dynamicHeightBufferSize:1,showFilteredItemsOnly:!1,renderExternal:void 0,setListHeight:!0,searchByItem:void 0,searchAll:void 0,itemTemplate:void 0,ul:null,createUl:!0,renderItem:function(e){return('\n          <li>\n            <div class="item-content">\n              <div class="item-inner">\n                <div class="item-title">'+e+"</div>\n              </div>\n            </div>\n          </li>\n        ").trim()},on:{}};if(l.useModulesParams(p),l.params=i.extend(p,n),void 0!==l.params.height&&l.params.height||(l.params.height=o),l.$el=a(n.el),l.el=l.$el[0],0!==l.$el.length){l.$el[0].f7VirtualList=l,l.items=l.params.items,l.params.showFilteredItemsOnly&&(l.filteredItems=[]),l.params.itemTemplate?"string"==typeof l.params.itemTemplate?l.renderItem=t.t7.compile(l.params.itemTemplate):"function"==typeof l.params.itemTemplate&&(l.renderItem=l.params.itemTemplate):l.params.renderItem&&(l.renderItem=l.params.renderItem),l.$pageContentEl=l.$el.parents(".page-content"),l.pageContentEl=l.$pageContentEl[0],void 0!==l.params.updatableScroll?l.updatableScroll=l.params.updatableScroll:(l.updatableScroll=!0,s.ios&&s.osVersion.split(".")[0]<8&&(l.updatableScroll=!1));var m,h=l.params.ul;l.$ul=h?a(l.params.ul):l.$el.children("ul"),0===l.$ul.length&&l.params.createUl&&(l.$el.append("<ul></ul>"),l.$ul=l.$el.children("ul")),l.ul=l.$ul[0],m=l.ul||l.params.createUl?l.$ul:l.$el,i.extend(l,{$itemsWrapEl:m,itemsWrapEl:m[0],domCache:{},displayDomCache:{},tempDomElement:r.createElement("ul"),lastRepaintY:null,fragment:r.createDocumentFragment(),pageHeight:void 0,rowsPerScreen:void 0,rowsBefore:void 0,rowsAfter:void 0,rowsToRender:void 0,maxBufferHeight:0,listHeight:void 0,dynamicHeight:"function"==typeof l.params.height}),l.useModules();var d,c,f,u,g=l.handleScroll.bind(l),v=l.handleResize.bind(l);return l.attachEvents=function(){d=l.$el.parents(".page").eq(0),c=l.$el.parents(".tab").eq(0),f=l.$el.parents(".panel").eq(0),u=l.$el.parents(".popup").eq(0),l.$pageContentEl.on("scroll",g),d&&d.on("page:reinit",v),c&&c.on("tab:show",v),f&&f.on("panel:open",v),u&&u.on("popup:open",v),t.on("resize",v)},l.detachEvents=function(){l.$pageContentEl.off("scroll",g),d&&d.off("page:reinit",v),c&&c.off("tab:show",v),f&&f.off("panel:open",v),u&&u.off("popup:open",v),t.off("resize",v)},l.init(),l}}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.setListSize=function(){var e=this,t=e.filteredItems||e.items;if(e.pageHeight=e.$pageContentEl[0].offsetHeight,e.dynamicHeight){e.listHeight=0,e.heights=[];for(var r=0;r<t.length;r+=1){var a=e.params.height(t[r]);e.listHeight+=a,e.heights.push(a)}}else e.listHeight=Math.ceil(t.length/e.params.cols)*e.params.height,e.rowsPerScreen=Math.ceil(e.pageHeight/e.params.height),e.rowsBefore=e.params.rowsBefore||2*e.rowsPerScreen,e.rowsAfter=e.params.rowsAfter||e.rowsPerScreen,e.rowsToRender=e.rowsPerScreen+e.rowsBefore+e.rowsAfter,e.maxBufferHeight=e.rowsBefore/2*e.params.height;(e.updatableScroll||e.params.setListHeight)&&e.$itemsWrapEl.css({height:e.listHeight+"px"})},t.prototype.render=function(e,t){var r=this;e&&(r.lastRepaintY=null);var a=-(r.$el[0].getBoundingClientRect().top-r.$pageContentEl[0].getBoundingClientRect().top);if(void 0!==t&&(a=t),null===r.lastRepaintY||Math.abs(a-r.lastRepaintY)>r.maxBufferHeight||!r.updatableScroll&&r.$pageContentEl[0].scrollTop+r.pageHeight>=r.$pageContentEl[0].scrollHeight){r.lastRepaintY=a;var i,s,n,o=r.filteredItems||r.items,l=0,p=0;if(r.dynamicHeight){var m,h=0;r.maxBufferHeight=r.pageHeight;for(var d=0;d<r.heights.length;d+=1)m=r.heights[d],void 0===i&&(h+m>=a-2*r.pageHeight*r.params.dynamicHeightBufferSize?i=d:l+=m),void 0===s&&((h+m>=a+2*r.pageHeight*r.params.dynamicHeightBufferSize||d===r.heights.length-1)&&(s=d+1),p+=m),h+=m;s=Math.min(s,o.length)}else(i=(parseInt(a/r.params.height,10)-r.rowsBefore)*r.params.cols)<0&&(i=0),s=Math.min(i+r.rowsToRender*r.params.cols,o.length);var c,f=[];for(r.reachEnd=!1,c=i;c<s;c+=1){var u=void 0,g=r.items.indexOf(o[c]);c===i&&(r.currentFromIndex=g),c===s-1&&(r.currentToIndex=g),r.filteredItems?r.items[g]===r.filteredItems[r.filteredItems.length-1]&&(r.reachEnd=!0):g===r.items.length-1&&(r.reachEnd=!0),r.params.renderExternal?f.push(o[c]):r.domCache[g]?(u=r.domCache[g]).f7VirtualListIndex=g:(r.renderItem?r.tempDomElement.innerHTML=r.renderItem(o[c],g).trim():r.tempDomElement.innerHTML=o[c].toString().trim(),u=r.tempDomElement.childNodes[0],r.params.cache&&(r.domCache[g]=u),u.f7VirtualListIndex=g),c===i&&(n=r.dynamicHeight?l:c*r.params.height/r.params.cols),r.params.renderExternal||(u.style.top=n+"px",r.emit("local::itemBeforeInsert vlItemBeforeInsert",r,u,o[c]),r.fragment.appendChild(u))}r.updatableScroll||(r.dynamicHeight?r.itemsWrapEl.style.height=p+"px":r.itemsWrapEl.style.height=c*r.params.height/r.params.cols+"px"),r.params.renderExternal?o&&0===o.length&&(r.reachEnd=!0):(r.emit("local::beforeClear vlBeforeClear",r,r.fragment),r.itemsWrapEl.innerHTML="",r.emit("local::itemsBeforeInsert vlItemsBeforeInsert",r,r.fragment),o&&0===o.length?(r.reachEnd=!0,r.params.emptyTemplate&&(r.itemsWrapEl.innerHTML=r.params.emptyTemplate)):r.itemsWrapEl.appendChild(r.fragment),r.emit("local::itemsAfterInsert vlItemsAfterInsert",r,r.fragment)),void 0!==t&&e&&r.$pageContentEl.scrollTop(t,0),r.params.renderExternal&&r.params.renderExternal(r,{fromIndex:i,toIndex:s,listHeight:r.listHeight,topPosition:n,items:f})}},t.prototype.filterItems=function(e,t){void 0===t&&(t=!0);var r=this;r.filteredItems=[];for(var a=0;a<e.length;a+=1)r.filteredItems.push(r.items[e[a]]);t&&(r.$pageContentEl[0].scrollTop=0),r.update()},t.prototype.resetFilter=function(){var e=this;e.params.showFilteredItemsOnly?e.filteredItems=[]:(e.filteredItems=null,delete e.filteredItems),e.update()},t.prototype.scrollToItem=function(e){var t=this;if(e>t.items.length)return!1;var r=0;if(t.dynamicHeight)for(var a=0;a<e;a+=1)r+=t.heights[a];else r=e*t.params.height;var i=t.$el[0].offsetTop;return t.render(!0,i+r-parseInt(t.$pageContentEl.css("padding-top"),10)),!0},t.prototype.handleScroll=function(){this.render()},t.prototype.isVisible=function(){return!!(this.el.offsetWidth||this.el.offsetHeight||this.el.getClientRects().length)},t.prototype.handleResize=function(){this.isVisible()&&(this.setListSize(),this.render(!0))},t.prototype.appendItems=function(e){for(var t=0;t<e.length;t+=1)this.items.push(e[t]);this.update()},t.prototype.appendItem=function(e){this.appendItems([e])},t.prototype.replaceAllItems=function(e){this.items=e,delete this.filteredItems,this.domCache={},this.update()},t.prototype.replaceItem=function(e,t){this.items[e]=t,this.params.cache&&delete this.domCache[e],this.update()},t.prototype.prependItems=function(e){for(var t=this,r=e.length-1;r>=0;r-=1)t.items.unshift(e[r]);if(t.params.cache){var a={};Object.keys(t.domCache).forEach(function(r){a[parseInt(r,10)+e.length]=t.domCache[r]}),t.domCache=a}t.update()},t.prototype.prependItem=function(e){this.prependItems([e])},t.prototype.moveItem=function(e,t){var r=this,a=e,i=t;if(a!==i){var s=r.items.splice(a,1)[0];if(i>=r.items.length?(r.items.push(s),i=r.items.length-1):r.items.splice(i,0,s),r.params.cache){var n={};Object.keys(r.domCache).forEach(function(e){var t=parseInt(e,10),s=a<i?a:i,o=a<i?i:a,l=a<i?-1:1;(t<s||t>o)&&(n[t]=r.domCache[t]),t===s&&(n[o]=r.domCache[t]),t>s&&t<=o&&(n[t+l]=r.domCache[t])}),r.domCache=n}r.update()}},t.prototype.insertItemBefore=function(e,t){var r=this;if(0!==e)if(e>=r.items.length)r.appendItem(t);else{if(r.items.splice(e,0,t),r.params.cache){var a={};Object.keys(r.domCache).forEach(function(t){var i=parseInt(t,10);i>=e&&(a[i+1]=r.domCache[i])}),r.domCache=a}r.update()}else r.prependItem(t)},t.prototype.deleteItems=function(e){for(var t,r=this,a=0,i=function(i){var s=e[i];void 0!==t&&s>t&&(a=-i),s+=a,t=e[i];var n=r.items.splice(s,1)[0];if(r.filteredItems&&r.filteredItems.indexOf(n)>=0&&r.filteredItems.splice(r.filteredItems.indexOf(n),1),r.params.cache){var o={};Object.keys(r.domCache).forEach(function(e){var t=parseInt(e,10);t===s?delete r.domCache[s]:parseInt(e,10)>s?o[t-1]=r.domCache[e]:o[t]=r.domCache[e]}),r.domCache=o}},s=0;s<e.length;s+=1)i(s);r.update()},t.prototype.deleteAllItems=function(){var e=this;e.items=[],delete e.filteredItems,e.params.cache&&(e.domCache={}),e.update()},t.prototype.deleteItem=function(e){this.deleteItems([e])},t.prototype.clearCache=function(){this.domCache={}},t.prototype.update=function(e){e&&this.params.cache&&(this.domCache={}),this.setListSize(),this.render(!0)},t.prototype.init=function(){this.attachEvents(),this.setListSize(),this.render()},t.prototype.destroy=function(){var e=this;e.detachEvents(),e.$el[0].f7VirtualList=null,delete e.$el[0].f7VirtualList,i.deleteProps(e),e=null},t}(n)),p={name:"virtualList",static:{VirtualList:l},create:function(){this.virtualList=o({defaultSelector:".virtual-list",constructor:l,app:this,domProp:"f7VirtualList"})}};if(t){if(e.prototype.modules&&e.prototype.modules[p.name])return;e.use(p),e.instance&&(e.instance.useModuleParams(p,e.instance.params),e.instance.useModule(p))}return p}(Framework7, typeof Framework7AutoInstallComponent === 'undefined' ? undefined : Framework7AutoInstallComponent))