const selection = window.getSelection();
const selectionRange = selection.getRangeAt(0);

function getToANormalNodeType(node) {
  if (node.nodeType === 1) {
    return {
      nodeName: node.nodeName,
      id: node.id,
      classList: node.classList,
    };
  } else {
    return getToANormalNodeType(node.parentNode);
  }
}

(async (selectionRange) => {
  let rangeContainer = {};

  // Check if we are in the same container
  if (selectionRange.startContainer === selectionRange.endContainer) {
    rangeContainer.startContainerParent = await getToANormalNodeType(selectionRange.startContainer);
    rangeContainer.endContainerParent = false;
  } else {
    rangeContainer.startContainerParent = await getToANormalNodeType(selectionRange.startContainer);
    rangeContainer.endContainerParent = await getToANormalNodeType(selectionRange.endContainer);
  }

  console.log(rangeContainer);

})(selectionRange)

// console.log(selectionRange);

// (async (node) => {
//   const nodeName = await getToANormalNodeType(node);
//   // browser.runtime.sendMessage({
//   //   type: 'selected-text',
//   //   body: {
//   //     nodeName
//   //   },
//   // });
//   // console.log(result);

  var treeWalker = document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    { acceptNode: function(node) { return node.nodeName === nodeName; } },
    false
  );
  
  var nodeList = [];
  
  while(treeWalker.nextNode()) nodeList.push(treeWalker.currentNode);

//   console.log(nodeList);

//   // nodeList.filter((node) => {node.textContent.includes("A data type provides a set of values from which an ")})

// })(selection.anchorNode);

// console.log(selection);
