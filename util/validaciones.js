module.exports = {

    arrayVacio: function(array, nombreArray){

        console.log("tam array "+nombreArray+" : "+array.length)

        if( array.length == 0) {

            return true; // Object is empty (Would return true in this example)
        } else {
            return false;
        }

    }

}