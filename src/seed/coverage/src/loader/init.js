function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/loader/init.js']) {
  _$jscoverage['/loader/init.js'] = {};
  _$jscoverage['/loader/init.js'].lineData = [];
  _$jscoverage['/loader/init.js'].lineData[6] = 0;
  _$jscoverage['/loader/init.js'].lineData[7] = 0;
  _$jscoverage['/loader/init.js'].lineData[9] = 0;
  _$jscoverage['/loader/init.js'].lineData[10] = 0;
  _$jscoverage['/loader/init.js'].lineData[11] = 0;
  _$jscoverage['/loader/init.js'].lineData[12] = 0;
  _$jscoverage['/loader/init.js'].lineData[14] = 0;
  _$jscoverage['/loader/init.js'].lineData[16] = 0;
  _$jscoverage['/loader/init.js'].lineData[19] = 0;
  _$jscoverage['/loader/init.js'].lineData[22] = 0;
  _$jscoverage['/loader/init.js'].lineData[25] = 0;
  _$jscoverage['/loader/init.js'].lineData[26] = 0;
  _$jscoverage['/loader/init.js'].lineData[27] = 0;
  _$jscoverage['/loader/init.js'].lineData[30] = 0;
  _$jscoverage['/loader/init.js'].lineData[32] = 0;
  _$jscoverage['/loader/init.js'].lineData[33] = 0;
  _$jscoverage['/loader/init.js'].lineData[35] = 0;
  _$jscoverage['/loader/init.js'].lineData[38] = 0;
  _$jscoverage['/loader/init.js'].lineData[39] = 0;
  _$jscoverage['/loader/init.js'].lineData[41] = 0;
  _$jscoverage['/loader/init.js'].lineData[46] = 0;
  _$jscoverage['/loader/init.js'].lineData[47] = 0;
  _$jscoverage['/loader/init.js'].lineData[49] = 0;
  _$jscoverage['/loader/init.js'].lineData[52] = 0;
  _$jscoverage['/loader/init.js'].lineData[53] = 0;
  _$jscoverage['/loader/init.js'].lineData[55] = 0;
  _$jscoverage['/loader/init.js'].lineData[56] = 0;
  _$jscoverage['/loader/init.js'].lineData[57] = 0;
  _$jscoverage['/loader/init.js'].lineData[58] = 0;
  _$jscoverage['/loader/init.js'].lineData[59] = 0;
  _$jscoverage['/loader/init.js'].lineData[61] = 0;
  _$jscoverage['/loader/init.js'].lineData[65] = 0;
  _$jscoverage['/loader/init.js'].lineData[66] = 0;
  _$jscoverage['/loader/init.js'].lineData[67] = 0;
  _$jscoverage['/loader/init.js'].lineData[68] = 0;
  _$jscoverage['/loader/init.js'].lineData[70] = 0;
  _$jscoverage['/loader/init.js'].lineData[74] = 0;
  _$jscoverage['/loader/init.js'].lineData[76] = 0;
  _$jscoverage['/loader/init.js'].lineData[90] = 0;
  _$jscoverage['/loader/init.js'].lineData[93] = 0;
  _$jscoverage['/loader/init.js'].lineData[97] = 0;
  _$jscoverage['/loader/init.js'].lineData[98] = 0;
  _$jscoverage['/loader/init.js'].lineData[99] = 0;
  _$jscoverage['/loader/init.js'].lineData[103] = 0;
  _$jscoverage['/loader/init.js'].lineData[104] = 0;
  _$jscoverage['/loader/init.js'].lineData[107] = 0;
  _$jscoverage['/loader/init.js'].lineData[114] = 0;
  _$jscoverage['/loader/init.js'].lineData[117] = 0;
  _$jscoverage['/loader/init.js'].lineData[123] = 0;
  _$jscoverage['/loader/init.js'].lineData[125] = 0;
}
if (! _$jscoverage['/loader/init.js'].functionData) {
  _$jscoverage['/loader/init.js'].functionData = [];
  _$jscoverage['/loader/init.js'].functionData[0] = 0;
  _$jscoverage['/loader/init.js'].functionData[1] = 0;
  _$jscoverage['/loader/init.js'].functionData[2] = 0;
  _$jscoverage['/loader/init.js'].functionData[3] = 0;
  _$jscoverage['/loader/init.js'].functionData[4] = 0;
}
if (! _$jscoverage['/loader/init.js'].branchData) {
  _$jscoverage['/loader/init.js'].branchData = {};
  _$jscoverage['/loader/init.js'].branchData['7'] = [];
  _$jscoverage['/loader/init.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['25'] = [];
  _$jscoverage['/loader/init.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['26'] = [];
  _$jscoverage['/loader/init.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['32'] = [];
  _$jscoverage['/loader/init.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['38'] = [];
  _$jscoverage['/loader/init.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['39'] = [];
  _$jscoverage['/loader/init.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['46'] = [];
  _$jscoverage['/loader/init.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['52'] = [];
  _$jscoverage['/loader/init.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['57'] = [];
  _$jscoverage['/loader/init.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['65'] = [];
  _$jscoverage['/loader/init.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['67'] = [];
  _$jscoverage['/loader/init.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['74'] = [];
  _$jscoverage['/loader/init.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['97'] = [];
  _$jscoverage['/loader/init.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['114'] = [];
  _$jscoverage['/loader/init.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/loader/init.js'].branchData['123'] = [];
  _$jscoverage['/loader/init.js'].branchData['123'][1] = new BranchData();
}
_$jscoverage['/loader/init.js'].branchData['123'][1].init(3508, 31, 'doc && doc.getElementsByTagName');
function visit474_123_1(result) {
  _$jscoverage['/loader/init.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['114'][1].init(3221, 11, 'S.UA.nodejs');
function visit473_114_1(result) {
  _$jscoverage['/loader/init.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['97'][1].init(209, 6, 'i >= 0');
function visit472_97_1(result) {
  _$jscoverage['/loader/init.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['74'][1].init(1678, 21, 'baseInfo.base || base');
function visit471_74_1(result) {
  _$jscoverage['/loader/init.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['67'][1].init(70, 17, 'queryIndex !== -1');
function visit470_67_1(result) {
  _$jscoverage['/loader/init.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['65'][1].init(1303, 20, '!(\'tag\' in baseInfo)');
function visit469_65_1(result) {
  _$jscoverage['/loader/init.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['57'][1].init(21, 23, 'part.match(baseTestReg)');
function visit468_57_1(result) {
  _$jscoverage['/loader/init.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['52'][1].init(179, 36, 'base.charAt(base.length - 1) !== \'/\'');
function visit467_52_1(result) {
  _$jscoverage['/loader/init.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['46'][1].init(610, 12, 'index === -1');
function visit466_46_1(result) {
  _$jscoverage['/loader/init.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['39'][1].init(455, 36, 'baseInfo.comboSep || defaultComboSep');
function visit465_39_1(result) {
  _$jscoverage['/loader/init.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['38'][1].init(388, 42, 'baseInfo.comboPrefix || defaultComboPrefix');
function visit464_38_1(result) {
  _$jscoverage['/loader/init.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['32'][1].init(250, 8, 'baseInfo');
function visit463_32_1(result) {
  _$jscoverage['/loader/init.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['26'][1].init(118, 23, '!src.match(baseTestReg)');
function visit462_26_1(result) {
  _$jscoverage['/loader/init.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['25'][1].init(88, 16, 'script.src || \'\'');
function visit461_25_1(result) {
  _$jscoverage['/loader/init.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].branchData['7'][1].init(15, 33, 'S.Env.host && S.Env.host.document');
function visit460_7_1(result) {
  _$jscoverage['/loader/init.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/init.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/init.js'].functionData[0]++;
  _$jscoverage['/loader/init.js'].lineData[7]++;
  var doc = visit460_7_1(S.Env.host && S.Env.host.document);
  _$jscoverage['/loader/init.js'].lineData[9]++;
  var Utils = S.Loader.Utils;
  _$jscoverage['/loader/init.js'].lineData[10]++;
  var TIMESTAMP = '@TIMESTAMP@';
  _$jscoverage['/loader/init.js'].lineData[11]++;
  var defaultComboPrefix = '??';
  _$jscoverage['/loader/init.js'].lineData[12]++;
  var defaultComboSep = ',';
  _$jscoverage['/loader/init.js'].lineData[14]++;
  function returnJson(s) {
    _$jscoverage['/loader/init.js'].functionData[1]++;
    _$jscoverage['/loader/init.js'].lineData[16]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/init.js'].lineData[19]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/init.js'].lineData[22]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/init.js'].functionData[2]++;
    _$jscoverage['/loader/init.js'].lineData[25]++;
    var src = visit461_25_1(script.src || '');
    _$jscoverage['/loader/init.js'].lineData[26]++;
    if (visit462_26_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/init.js'].lineData[27]++;
      return 0;
    }
    _$jscoverage['/loader/init.js'].lineData[30]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/init.js'].lineData[32]++;
    if (visit463_32_1(baseInfo)) {
      _$jscoverage['/loader/init.js'].lineData[33]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/init.js'].lineData[35]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/init.js'].lineData[38]++;
    var comboPrefix = visit464_38_1(baseInfo.comboPrefix || defaultComboPrefix);
    _$jscoverage['/loader/init.js'].lineData[39]++;
    var comboSep = visit465_39_1(baseInfo.comboSep || defaultComboSep);
    _$jscoverage['/loader/init.js'].lineData[41]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/init.js'].lineData[46]++;
    if (visit466_46_1(index === -1)) {
      _$jscoverage['/loader/init.js'].lineData[47]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/init.js'].lineData[49]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/init.js'].lineData[52]++;
      if (visit467_52_1(base.charAt(base.length - 1) !== '/')) {
        _$jscoverage['/loader/init.js'].lineData[53]++;
        base += '/';
      }
      _$jscoverage['/loader/init.js'].lineData[55]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/init.js'].lineData[56]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/init.js'].functionData[3]++;
  _$jscoverage['/loader/init.js'].lineData[57]++;
  if (visit468_57_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/init.js'].lineData[58]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/init.js'].lineData[59]++;
    return false;
  }
  _$jscoverage['/loader/init.js'].lineData[61]++;
  return undefined;
});
    }
    _$jscoverage['/loader/init.js'].lineData[65]++;
    if (visit469_65_1(!('tag' in baseInfo))) {
      _$jscoverage['/loader/init.js'].lineData[66]++;
      var queryIndex = src.lastIndexOf('?t=');
      _$jscoverage['/loader/init.js'].lineData[67]++;
      if (visit470_67_1(queryIndex !== -1)) {
        _$jscoverage['/loader/init.js'].lineData[68]++;
        var query = src.substring(queryIndex + 1);
        _$jscoverage['/loader/init.js'].lineData[70]++;
        baseInfo.tag = Utils.getHash(TIMESTAMP + query);
      }
    }
    _$jscoverage['/loader/init.js'].lineData[74]++;
    baseInfo.base = visit471_74_1(baseInfo.base || base);
    _$jscoverage['/loader/init.js'].lineData[76]++;
    return baseInfo;
  }
  _$jscoverage['/loader/init.js'].lineData[90]++;
  function getBaseInfo() {
    _$jscoverage['/loader/init.js'].functionData[4]++;
    _$jscoverage['/loader/init.js'].lineData[93]++;
    var scripts = doc.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/init.js'].lineData[97]++;
    for (i = scripts.length - 1; visit472_97_1(i >= 0); i--) {
      _$jscoverage['/loader/init.js'].lineData[98]++;
      if ((info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/init.js'].lineData[99]++;
        return info;
      }
    }
    _$jscoverage['/loader/init.js'].lineData[103]++;
    S.log('must load kissy by file name in browser environment: seed.js or seed-min.js', 'error');
    _$jscoverage['/loader/init.js'].lineData[104]++;
    return null;
  }
  _$jscoverage['/loader/init.js'].lineData[107]++;
  S.config({
  comboPrefix: defaultComboPrefix, 
  comboSep: defaultComboSep, 
  charset: 'utf-8', 
  lang: 'zh-cn'});
  _$jscoverage['/loader/init.js'].lineData[114]++;
  if (visit473_114_1(S.UA.nodejs)) {
    _$jscoverage['/loader/init.js'].lineData[117]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/init.js'].lineData[123]++;
    if (visit474_123_1(doc && doc.getElementsByTagName)) {
      _$jscoverage['/loader/init.js'].lineData[125]++;
      S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40}, getBaseInfo()));
    }
  }
})(KISSY);
