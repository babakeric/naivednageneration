angular.module('naiveDNA', [])

.controller('bodyCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.mainTitle = 'A Naive DNA Generation Algorithm'
	$scope.subTitle = "But what isn't?"
	$scope.seqs = {};

	$scope.getSeqs = function() {
		$http.get('http://localhost:9000/dnas').success(function(data) {
			$scope.seqs = data;
		});
	};

	$scope.genDNA = function() {
	    var envelopeContents = {
	        n: $scope.numNts
	    };

	    var sentEnvelope = $http.post('http://localhost:9000/genDNA', envelopeContents);

	    // could handle this like we did with .success in getSeqs, but for
	    // the sake of variety/learning we will use the promise method then
	    // see <https://docs.angularjs.org/api/ng/service/$q>
	    // promise.then(success,error,update);

	    sentEnvelope.then(function(reply) {
	        // person got our envelope, did some stuff, sent us back a reply
	        $scope.currentSeq = reply.data.output;
		}, function(reason) {
			alert('Failed: ' + reason);
		}, function(update) {
			alert('Got notification: ' + update);
	    });
	};
}]);


