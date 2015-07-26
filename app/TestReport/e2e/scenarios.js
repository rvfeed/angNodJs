'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('myApp', function() {
console.log('Hi');
  beforeEach(function() {
    browser().navigateTo('/');
  });


  it('should automatically redirect to /Listall when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/listall");
  });


  describe('Listall', function() {

    beforeEach(function() {
      browser().navigateTo('/#/listall');
    });


    it('should render Listall when user navigates to /Listall', function() {
      expect(element('[ng-click]').text()).
        toMatch('Account IDFirst NameLast NameStatePhoneCommodityPremiseTypeService DateUtility Account NumberAssigned ToAnnual kWhStatusStatus DateContact StatusContact Status Date');
    });

  });


 /* describe('SecondList', function() {

    beforeEach(function() {
      browser().navigateTo('/#/listall');
    });


    it('should render SecondList when user navigates to /Listall', function() {
      expect(element('[ng-repeat]').text()).
        toMatch();
    });

  });*/
});
