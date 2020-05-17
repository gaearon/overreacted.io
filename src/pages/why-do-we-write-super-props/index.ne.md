---
title: हामी किन super(props) लेख्छौं?
date: '2018-11-30'
spoiler: अन्तमा एउटा मोड़ छ।
---


मैले सुने [Hooks](https://reactjs.org/docs/hooks-intro.html) अचेल चर्चा मा छ।  विडंबनाको कुरा, म यो ब्लग को लागी *क्लास* कोम्पोनेंट को बारेमा रमाईलो तथ्यहरु बयान गरी शुरू गर्न चाहान्छु। तेसो गर्दा कस्तो होला!

**React लाई उपयोगी रुपमा प्रयोग गर्न निम्न तरिकाहरू महत्त्वपूर्ण *छैन*। तर यदि तपाईं चीजहरूकाे कामगर्ने तरिका काे गहिराइमा विश्लेषण गर्न चाहनुहुन्छ भने तपाईलाई तिनीहरू रोमान्चक लग्न सक्छ।**

पहिलो कुरा यस्तो छ।

---

मैले मेरो जीवनमा `super(props)` जान्न चाहेको भन्दा धेरै पटक लेखेको छु:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

अवश्यपनि, [class fields proposal](https://github.com/tc39/proposal-class-fields) ले यो प्रकिर्यलाई छोड्न दिन्छ:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

यस्तो किसिम को syntax [प्लान](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) गिरएको थियो जब सन 2015 मा React 0.13 मा सादा क्लासको लागि समर्थन थपियो । डिफाइँनिग् `constructor` र कलिंग `super(props)` क्लास फिल्डहरूले एक एर्गोनोमिक विकल्प प्रदान नगरेसम्म अस्थायी समाधान हुने उद्देश्यले राखिएको थियो।

तर हामी ES2015 विशेषताहरु प्रयोग गरेर पहिलेकै उदाहरणमा फर्कौं है:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**हामी किन `super` कल गर्ने? कल *नगरे* हुदैन र? यदि हामीले यसलाई कल गर्नुपर्‍यो भने, `props` पास नगरे के हुन्छ? के त्यहाँ कुनै अन्य अर्गुमेंट पनि छन्?** लौ हेरम् है त ।

---

JavaScript मा, `super`ले अभिभावक क्लास को कन्स्ट्रक्टर लाई बुझाउँछ. (हाम्रो उदाहरणमा, एसले `React.Component` कार्यान्वयन लाई जनाउदछ.)

महत्त्वपूर्ण कुरा, अभिभावकाे कन्स्ट्रक्टर कल *नगरे सम्म* तपाईं आफ्नाे कन्स्ट्रक्टर मा `this` प्रयोग गर्न सक्नुहुन्न। JavaScript ले तपाईंलाई अनुमति दिँदैन:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Can’t use `this` yet
    super(props);
    // ✅ Now it’s okay though
    this.state = { isOn: true };
  }
  // ...
}
```

त्यहाँ JavaScript ले अभिभावक कन्स्ट्रक्टर लाई तपाईंले `this` छुनु भन्दा अघि चालुउनु को राम्रो कारणहरू छन्। क्लास श्रेणीक्रम विचार गर्नुहोस्:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 यो अस्वीकृत गरिएको छ, तल पढ्नुहोस् किन
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

कल्पना गर्नुहोस् `this` काे प्रयोगलाइ `super` कल हुनु भन्दा पहिले लेख्नन अनुमति दिईयो। एक महिना पछि, हामी `greetColleagues` परिवर्तन गर्न चाहान्छै जसकाे सन्देशमा व्यक्तिको नाम समावेश होस्:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

तर हामीले त्यो बिर्स्यौं कि `super()` ले `this.name` सेट अप गर्न मौका पाउनु भन्दा पहिलेनै `this.greetColleagues()` लाई कल गरियाे । तेसैले `this.name` अझै परिभाषित छैन! तपाईले देख्नन सक्नुहुन्छ, यस किसिमका कोड सोच्न धेरै गाह्रो हुन सक्छ।

त्यस्ता समस्याहरूबाट बच्न, **JavaScript कडाईका साथ लागू गर्दछ कि यदि तपाइँ कन्स्ट्रक्टरमा `this` प्रयोग गर्न चाहानुहुन्छ भने, तपाईंले पहिले `super` लाई कल *गर्नै पर्छ*.** parent लाई त्यसको गर्न दिनुहोस्! र यो सीमितता क्लास काे रूपमा परिभाषित भएका React कोम्पोनेंटस् मा पनि लागू हुन्छ:

```jsx
  constructor(props) {
    super(props);
    // ✅ अब `this` प्रयोग गर्न - ठीक छ
    this.state = { isOn: true };
  }
```

यसले हामीलाई अर्को प्रश्नको साथ छोडिदिन्छ: `props` किन पास गर्ने?

---

तपाईंलाई लग्नसक्छ कि `props` लाई तल `super` मा पास गर्नु आवश्यक छ ताकि base `React.Component` कन्स्ट्रक्टर ले `this.props` लाई सुचारु गर्न सकोस:

```jsx
// React भित्र
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

र त्यो वास्तवमा सत्यबाट टाढा छैन, यस्ले [तेही नै गर्छ](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

तर कुनै तरिकाले, तपाईंले `props` अर्गुमेंट बिना `super()` कल गरे पनि, `render` र अन्य कुनै methods मा तपाईं अझै `this.props` मा पहुँच गर्न सक्षम हुनुहुनेछ। (यदि तपाईं मलाई विश्वास गर्नुहुन्न भने, आफै यो प्रयास गर्नुहोस्!)

*यस्ले* कसरी काम गर्छ? खासमा के हुन्छ भने **React *तपाईंकाे* कन्स्ट्रक्टर कल गरे लगत्तै `props` लाई पनि त्यही instance मा असाइन गर्दछ:**

```jsx
  // React भित्र
  const instance = new YourComponent(props);
  instance.props = props;
```

त्यसोभए तपाईंले `super()` मा `props` पास ग्नन बिर्सनुभयो भने पनि, React ले स्वतह रूपमा तिनीहरूलाई लगत्तै सेट गर्दछ। यसाे गर्नुकाे त्यहाँ एक कारण छ।

जब React मा क्लासको लागि समर्थन थपियो, यसले मात्र ES6 क्लासको लागि समर्थन थपेन । लक्ष्य सकेसम्म धेरै क्लासको एब्स्ट्र्याक्सनको विस्तृत श्रृंखलालाई समर्थन गर्ने थियो। त्यो समयमा [स्पष्ट थिएन](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) कि कम्पोनेन्टहरू परिभाषित गर्नका लागि ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, वा अन्य समाधानहरू अपेक्षाकृत कति सफल हुनेछ। त्यसैले React आवश्यक रूपमा `super()` कल गर्ने कि नगर्ने भन्ने बारेमा जानबूझै अनपिनियोजित थियो — यो ES6 क्लासको लागि आवश्यक भए पनि।

के यसको मतलब यो भयाे कि `super (props)` सट्टामा तपाईं `super()` मात्र लेख्न सक्नुहुन्छ?

**सम्भवतः मिल्दैन किनकि यो कुरा अझै अस्पष्ट छ।** निश्चित पनि, तपाईंको कन्स्ट्रक्टर चालु भए *पछि* React ले `this.props` असाइन गर्दछ। तर `this.prop` अझै पनि `super` कल र तपाईंको कन्स्ट्रक्टरको अन्त्यको बीचमा अपरिभाषित हुनेछ:

```jsx{14}
// React भित्र
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// तपाईंकाे काेड भित्र
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 हामी props पास गर्न बिर्स्यौं
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 अपरिभाषित 
  }
  // ...
}
```

यो डिबग गर्न अझ चुनौतीपूर्ण हुन सक्छ यदि यो कन्स्ट्रक्टरबाट *बोलाइएको* कुनै method मा भयो भने। **र त्यसैले म सधै `super(props)` पास गर्न सिफारिश गर्दछु, यद्यपि यो कडाईका साथ लागु गर्न आवश्यक छैन:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ हामीले props पास गर्यै
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

यसले सुनिश्चित गर्दछ `this.prop` कन्स्ट्रक्टर बाहिर निस्कनु अघि नै सेट गरिएको हुनेछ।

-----

यहाँ एक अन्तिम बिट छ जस्का लागि लामो समय देखि React काे उपयोगकर्ताहरु उत्सुक हुन सक्छ।

तपाईंले याद गर्नुभएको हुनसक्छ जब तपाईं Context API क्लासमा प्रयोग गर्नुहुन्छ (legacy काे `contextTypes` बाट वा React 16.6 मा थपिएकाे आधुनिक `contextType` API बाट), `context` कन्स्ट्रक्टर मा दोस्रो अर्गुमेंटकाे रूपमा पास गरिन्छ।

त्यसोभए हामी यसको सट्टामा `super(props, context)` किन लेख्दैनौं? हामी लेख्नन सक्दछौं, तर context कम प्रयोग गरिन्छ त्यसैले यो समस्या यति आउँदैन।

**क्लास फिल्ड प्रस्तावको साथ यो सम्पूर्ण खतरा जसो भए पनि हराउँछ।** explicit कन्स्ट्रक्टर बिना, सबै अर्गुमेंट स्वचालित रूपमा तल पास गरिन्छ। यसैले गर्दा आवश्यक भएमा `state = {}` जस्ता expression मा `this.props` वा `this.context` काे रेफरेन्स समावेश गर्न मिल्छ।

Hooks को साथ, हामीसँग `super` वा `this` पनि रहदैन। तर त्यो शीर्षक अर्को दिनको लागि हो।
