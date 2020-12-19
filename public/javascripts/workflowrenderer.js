const data = JSON.parse(document.getElementById('wfdata').innerHTML);
const outelement = document.getElementById('workflow');
const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
outelement.append(svgelement);

svgelement.setAttributeNS(null, 'width', 500);
svgelement.setAttributeNS(null, 'height', 500);

const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
square.setAttributeNS(null, 'x', 50);
square.setAttributeNS(null, 'y', 50);
square.setAttributeNS(null, 'width', 50);
square.setAttributeNS(null, 'height', 50);
square.setAttributeNS(null, 'fill', 'steelblue');
svgelement.append(square);