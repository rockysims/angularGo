'use strict';

/* jasmine specs for controllers go here */

/*
describe('controllers', function(){
  beforeEach(module('myGo.controllers'));


  it('should ....', inject(function() {
    //spec body
  }));

  it('should ....', inject(function() {
    //spec body
  }));
});
//*/

//*
describe('Board', function() {
	var board;
	beforeEach(function() {
		board = new Board(9);
	});
	
	it("is the right size", function() {
		expect(board.size).toBe(9);
	});
	
	it("has right number of places for its size", function() {
		expect(board.places.length).toBe(board.size * board.size);
	});
	
	it("starts with no stones on it", function() {
		var place, stones = 0;
		var i;
		for (i in board.places) {
			place = board.places[i];
			if (place.color != "e") {
				stones++;
			}
		}
		expect(stones).toBe(0);
	});
	
	it("has working stone placement", function() {
		var place = board.getPlaceByXY(0, 0);
		board.placeStone(place);
		expect(board.places[0].color).toBe("b");
	});
	
	it("has working turn alternation and getPlaceByXY()", function() {
		var place;
		place = board.getPlaceByXY(0, 0); //top left
		board.placeStone(place);
		place = board.getPlaceByXY(1, 0); //1 to the right of top left
		board.placeStone(place);
		place = board.getPlaceByXY(0, 1); 
		board.placeStone(place);
		place = board.getPlaceByXY(1, 1);
		board.placeStone(place);
		expect(board.places[0].color).toBe("b");
		expect(board.places[1].color).toBe("w");
		//board.place[size*y+x]
		expect(board.places[board.size*1+0].color).toBe("b");
		expect(board.places[board.size*1+1].color).toBe("w");
		
		expect(board.places[board.size*1+0].x).toBe(0);
		expect(board.places[board.size*1+0].y).toBe(1);
	});
	
	//it("correctly fills stones[]")
	
	it("correctly fills liberties[] for single stones", function() {
		var place;
		place = board.getPlaceByXY(4, 4);
		board.placeStone(place);
		
		var liberties = place.group.liberties;
		
		expect(liberties.length).toBe(4);
		
		var p;
		p = liberties[0];
		expect(p.x+","+p.y).toBe("5,4");
		p = liberties[1];
		expect(p.x+","+p.y).toBe("3,4");
		p = liberties[2];
		expect(p.x+","+p.y).toBe("4,5");
		p = liberties[3];
		expect(p.x+","+p.y).toBe("4,3");
	});
	
	it("assigns the same group to 2 stones of the same color in a row", function() {
		var place;
		place = board.getPlaceByXY(4, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(0, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(5, 4); //black
		board.placeStone(place);
		
		expect(board.getPlaceByXY(4, 4).color).toBe("b");
		expect(board.getPlaceByXY(5, 4).color).toBe("b");
		
		var g1 = board.getPlaceByXY(4, 4).group;
		var g2 = board.getPlaceByXY(5, 4).group;
		alert(g1);
		alert(g2);
		alert(g1 === g2);
		alert(g1 !== g2);
		expect(g1.id).toBe(g2.id);
	});
	
	it("test", function() {
		expect(true).toBe(true);
	});
	
	it("assigns the same group to 3 stones of the same color in a row", function() {
		var place;
		place = board.getPlaceByXY(4, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(0, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(5, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(1, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(6, 4); //black
		board.placeStone(place);
		
		expect(board.getPlaceByXY(4, 4).color).toBe("b");
		expect(board.getPlaceByXY(5, 4).color).toBe("b");
		expect(board.getPlaceByXY(6, 4).color).toBe("b");
		
		var g44 = board.getPlaceByXY(4, 4).group;
		expect(board.getPlaceByXY(4, 4).group.id).toBe(board.getPlaceByXY(4, 5).group.id);
		expect(board.getPlaceByXY(5, 4).group.id).toBe(board.getPlaceByXY(4, 5).group.id);
	});
	
	/*
	it("correctly fills liberties[] for 2 stones", function() {
		var place;
		place = board.getPlaceByXY(4, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(0, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(5, 4); //black
		board.placeStone(place);
		
		var liberties = place.group.liberties;
		
		expect(liberties.length).toBe(6);
		
		var p;
		p = liberties[0];
		expect(p.x+","+p.y).toBe("6,4");
		p = liberties[1];
		expect(p.x+","+p.y).toBe("5,5");
		p = liberties[2];
		expect(p.x+","+p.y).toBe("5,3");
		p = liberties[3];
		expect(p.x+","+p.y).toBe("3,4");
		p = liberties[4];
		expect(p.x+","+p.y).toBe("4,5");
		p = liberties[5];
		expect(p.x+","+p.y).toBe("4,3");
	});
	
	it("correctly fills liberties[] for 3 stones in a row", function() {
		return;
		var place;
		place = board.getPlaceByXY(4, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(0, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(5, 4); //black
		board.placeStone(place);
		place = board.getPlaceByXY(1, 0); //white
		board.placeStone(place);
		place = board.getPlaceByXY(6, 4); //black
		board.placeStone(place);
		
		var liberties = place.group.liberties;
		
		expect(liberties.length).toBe(6);
		
		var p;
		p = liberties[0];
		expect(p.x+","+p.y).toBe("6,4");
		p = liberties[1];
		expect(p.x+","+p.y).toBe("5,5");
		p = liberties[2];
		expect(p.x+","+p.y).toBe("5,3");
		p = liberties[3];
		expect(p.x+","+p.y).toBe("3,4");
		p = liberties[4];
		expect(p.x+","+p.y).toBe("4,5");
		p = liberties[5];
		expect(p.x+","+p.y).toBe("4,3");
	});
	//*/
});
//*/