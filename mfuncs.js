/* @author (c) Marc Meyer 2020 */
/**
 * List of all different permutations(no repeat) (stacked in rows)
 *
 * @param {Array [[]]} objectsArr  items to permute
 * @param {Number} k  choose (like allComb but w/ "duplicates")
 *
 * @returns List of all different permutations(no repeat) stacked in rows
 *
 * @customfunction
 */
function allPerms(objectsArr, k) {
  var inline = !cellsP([objectsArr]);

  objectsArr = canonCells(arguments, true);
  if (inline)
    k = objectsArr.pop(); // k is last parm if inlined

  k = k || objectsArr.length;
  var res = [];

  res = allPs(objectsArr, k);
  return res;
}

function allPs(items, k) {
  var s = new Set();
  var acc = [], curr = [];

  items.forEach((i)=>s.add(i));
  k = Math.min(k, s.size);

  doPerms(acc, curr, s, k);
  return acc;
}

function doPerms(acc, curr, s, k) {
  if (k == 0) {
    acc.push(curr.slice());
    return;
  }

  [...s].forEach((e) =>{
    s.delete(e);
    curr.push(e);
    doPerms(acc, curr, s, k-1);
    curr.pop();
    s.add(e);
  });
}

/**
 * List of all different combinations (stacked in rows)
 *
 * @param {val, val,... | range } objectsArr items to combine
 * @param {Number} k number to choose (default 2)
 *
 * @returns List of all different combinations (stacked in rows)
 *
 * @customfunction
 */
function allCombs(objectsArr, k) {
  var inline = !cellsP([objectsArr]);

  objectsArr = canonCells(arguments, true);
  if (inline)
    k = objectsArr.pop();

  if (typeof k !== 'number')
    k = objectsArr[0].length; //arbitrary but useful to understand result

  if (k > objectsArr.length)
    return [];

  return combF(objectsArr, k);
}

// distingish between cell references being passed in and values in packaged arguments
function cellsP(arg) {
  let ret =  Array.isArray(arg)
    && Array.isArray(arg[0])
    && Array.isArray(arg[0][0]);
  return ret;
}
/* @customfunction
*/
function canonCells(argsarray, flatP = false) {
  let ret = [...argsarray]; // convert
  // flattening
  if (flatP)
    return ret.flat(Infinity);

  if (!cellsP(ret))
    ret = [ret]; // turn into a "range"
  else
    ret = ret[0]; // unpack extra wrapping



  return ret;
}

function combF(a, n) {
  if (n === 0)
    return [[]];
  if (n === a.length)
    return [a.slice(0)];  // copy on return

  var el = a.shift();
  var nacc = [ ];
  var combs = combF(a, n-1);
  nacc = combs.map((part) => [el].concat(part));
  if (n <= a.length) {
    var t = combF(a, n);
    nacc = nacc.concat(t);
  }
  a.unshift(el); // undo modification for higher levels

  return nacc;
}
/**
 * Explode string into component characters
 *
 * @param {value | Cells} cellOrArray - item to explode
 *
 * @return a list of individual characters
 *
 * @customfunction
 */

function explodeChars(ref) {
  ref = canonCells(arguments, true);

  var rows = ref.join("").split("");
  return [rows];
}
/**
 * Return count of items for each unique item in range
 *
 * @param {Array[[]]} itemArray items to count
 *
 * @returns List of all unique items and count in 2 columns
 * @customfunction
 */

function countByItems(itemArray) {
  var counts = new Map();
  var ret = [];

  itemArray = canonCells(arguments, true);

  itemArray.forEach((item) => {
    var c = counts.get(item);
    c = c? c + 1: 1;
    counts.set(item, c);
  });

  return [...counts];
}
/**
 * returns columns with all ordered pairs ( x, y ) for which x belongs to Set1 and y belongs to Set2.
 *
 * @param {Range} items1 Set1
 * @param {Range} items2 Set2
 *
 * @customfunction
 */
function cartesianProduct(items1 = [], items2 = []) {
  var res = [];
  if (!Array.isArray(items1) || !Array.isArray(items2)) {
    throw new Error("arguments must be a range");
  }
  items1 = canonCells(items1,true);
  items2 = canonCells(items2,true);
  items1.forEach((first) => items2.forEach((second) => res.push([first, second])));
  return res;
}
/**
 * inner join on equality
 *
 * @param {Table1} items1 Table 1
 * @param {Table2} items2 Table 2
 * @param {ix1} ix1 0-based index of key in Table1
 * @param {ix2} ix2 0-based index of key in Table2
 *
 * @customfunction
 */
function innerJoinEQ(items1 = [[]], items2 = [[]], ix1= 0, ix2= 0) {
  var res = [];
  var item2ix = 0;
  var map = new Map();

  items1 = Array.isArray(items1)? items1: [[items1]];
  items2 = Array.isArray(items2)? items2: [[items2]];

  items2.forEach((item2) => {
    let entries = map.get(item2[ix2]) || [];
    entries.push(item2);
    map.set(item2[ix2], entries);
  });
  items1.forEach((item1) => {
    let entries = map.get(item1[ix1]) || [];
    entries.forEach((rightPart) => {
      let cp = rightPart.slice();
      cp.splice(ix2, 1);
      res.push([...item1, ...cp]);
    })
  });
  return res;
}

/**
 * incomplete
 */

function innerJoin(items1 = [[]], items2 = [[]],
                   ix1= 0, ix2= 0,
                   sort1 = false, sort2= false) {
  var res = [];
  var item2ix = 0;
  var sfn = (row1, row2) => row1[ix1] < row2[ix2]? -1: (row1[ix1] > row2[ix2]? 1: 0);
  if (!sort1)
    items1.sort(sfn);
  if (!sort2)
    items2.sort(sfn);
  items1.forEach((item1) => {
    while (item2ix < items2.length && item1[ix1] === items2[item2ix][ix2]) {
      let r1 = item1.slice();
      let r2 = items2[item2ix].slice();
      r2.splice(ix2, 1);
      r1.push(...r2);
      res.push(r1);
      item2ix += 1;
    }
  });
  return res;
}
/**
 * reverse range
 *
 * @param {Range} cells range to reverse
 *
 * @customfunction
 */
function rangeReverse(cells) {
  cells = canonCells(arguments, false);
  return rr(cells);
}
function rr(cells) {
  cells.reverse();
  let r = cells.filter((x)=>Array.isArray(x)).forEach(rr);
  return cells
}

/**
 * relational normalization
 *
 * @param {table} complete table to normalize
 * @param {keyix} 0-based key column
 * @param {reslist...} multiple lists, each a group of column indexes
 *
 * @customfunction
 */

function rNorm(table, keys, ...tabs) {
  if (!Array.isArray(keys))
    keys = [keys];
}

function rNormalize(table, keyix = 0, reslist = [[]]) {
  //canonicalize arguments
  if (!Array.isArray(table) || !Array.isArray(table[0])){
    throw new Error("First parameter must be a 2d range");
  }
  if (!Array.isArray(reslist)) // 1 => [[1]]
    reslist = [[reslist]];
  if (!Array.isArray(reslist[0])) // [1, 2] => [[1,2]]
    reslist = [reslist];
  //index
  let m = new Map();
  table.forEach((row) => {
    let entry = m.get(row[keyix]) || [];
    entry.push(row);
    m.set(row[keyix], entry);
  });
  let res = [[]];
  let resIx = 0;
  reslist.forEach((onetab) => {
    m.forEach((value, key) => {

    });
  });
  return res;
}

function tabColmap(table, list) {
  return list.map(e=>tabCol(table, e))
}

//external ix and table to internaal column ix
function tabCol(table, e){
  if (Number.isInteger(e))
    return e-1;
  e = table[0].indexOf(e);
  return e===-1? null: e;
}

/**
 * relational Projection, return only indicated columns
 *
 * @param {range} table relation/table
 * @param {int, String,...} index_list   cells or data with column numbers or header string
 *
 * @customfunction
 */

function rProject(table, ...ixlist){

  if (!Array.isArray(table) || !Array.isArray(table[0])){
    throw new Error("First parameter must be a range");
  }
  //TODO: Handle explicit 2d cells.
  ixlist = canonCells(ixlist,true);
  return ixlist;
  ixlist = tabColmap(table, ixlist)

  ntable = table.map(row=> ixlist.map(ix=>row[ix]))
  return ntable
}