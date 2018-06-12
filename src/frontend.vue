<template>
  <div id="app">
    <div v-show="view==='list'">
        <b-navbar variant="dark" type="dark">
          <b-navbar-nav href="#">
            <b-btn variant="light"
                   @click="ujallat">Új állat felvétele</b-btn>
          </b-navbar-nav>
          <b-nav-form action="#">
              <b-form-input
                   class="mr-sm-2"
                   type="text"
                   placeholder="Keres - állat vagy tulajdonos"
                   v-model="keres"
                   @click.native="keres=''"
                   @keyup.native.enter="keresenter"/>
          </b-nav-form>
        </b-navbar>
    </div>
    <div v-show="view==='uja' || view==='edit'">
        <b-navbar variant="dark" type="dark">
          <b-navbar-nav href="#">
            <b-btn variant="light"
                   @click="view='list'">Vissza a listához</b-btn>
          </b-navbar-nav>
        </b-navbar>
    </div>
    <div id="body">
        <div class="text-center cim">Körzeti kötelező oltás - nyilvántartás</div>
        <h5 class="text-center kerek">Kukutyin</h5>
        <div style="height:4px;"></div>
        <div v-show="view==='list' && tbody.length" class="kerek">
          <div style="height:13px;"></div>
          <b-table striped dark
                   :fields="thead"
                   :items="tbody">
                   <template slot="_id" slot-scope="data">
                        <b-btn size="sm"
                               @click="edit(`${data.value}`)"
                               variant="success">módosít</b-btn>
                        /
                        <b-btn size="sm"
                               @click="del(`${data.value}`)"
                               variant="danger">töröl</b-btn>
                   </template>
          </b-table>
        </div>
        <div v-show="!tbody.length  && view==='list'"
             class="text-center"><br>
             <div v-if="tbody_origin.length" class="red">
               Nincs az adatbázisban a keresési feltételnek megfelelő állat!
             </div>
             <div v-if="!tbody_origin.length" class="red">
               Az adatbázis üres!
             </div>
             <br><br>
          <b-btn variant="danger"
                 @click="ujallat">Új állat felvétele</b-btn>
        </div>
        <div class="row" v-show="view==='uja' || view==='edit'">
          <div class="col"></div>
          <div class="col">
            <hr>
            <h5 class="text-center" v-if="!form._id">Új állat felvétele</h5>
            <h5 class="text-center" v-if="form._id">Adatmódosítás</h5>
            <hr>
            <b-form name="f1">
            Állat neve
            <div class="row">
              <div class="col">
                <b-input placeholder="Állat neve" required
                         ref="allnevi" v-model="form.allatnev" />
              </div>
              <div v-if="form.allatnev && !form.tulajnev">
                <b-btn @click="csere">&#8675;</b-btn>
              </div>
            </div>
            Tulajdonos neve

            <b-input ref="tulnevi" required
                     placeholder="Tulajdonos neve"
                     v-model="form.tulajnev" />
            Tulajdonos telefonszáma
            <b-input placeholder="Tulajdonos telefonszáma" required
                     v-model="form.tultel" />
            Fajta
            <b-input list="fajta"
                     placeholder="Fajája"
                     required
                     v-model="form.fajta" />
            <datalist id="fajta">
              <option v-for="fajta in flist">{{fajta}}</option>
            </datalist>
            Születési év
            <b-input list="fajta" type="number" min="1980"
                     :max="new Date().getYear()+1900"
                     v-model="form.szule" />
            Veszettségi oltás dátuma
            <b-input type="date" list="fajta"
                     v-model="form.veszolip" />
            </b-form>
            <hr>
            <div class="text-center">
                <b-btn v-if="form.allatnev && form.tulajnev && form.fajta"
                       @click='ment'>Mentés</b-btn>
            </div>
          </div>
          <div class="col"></div>
        </div>
      </div>
      <div v-if="hiba" class="text-center red">
        Hálózati hiba, a módosításokat nem sikerült menteni!
      </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      keres : '',
      hiba  : false,
      view  : 'list',
      thead : [
        { key: 'tulajnev', label: 'Tulajdonos neve', sortable: true},
        { key: 'tultel', label: 'Tulajdonos telefonszáma'},
        { key: 'allatnev', label: 'Állat neve', sortable: true},
        { key: 'fajta', label: 'Fajtája'},
        { key: 'szule', label: 'Születési éve'},
        { key: 'veszolip', label: 'Utolsó oltás', sortable: true},
        { key: '_id', label: 'Szerk. / Törl.'},
      ],
      tbody_origin: [],
      form: {}
    }
  },
  methods: {
    csere() {
      this.$set( this.form, 'tulajnev', this.form.allatnev )
      this.$set( this.form, 'allatnev', '' )
      let ivsi = setInterval( () => {
        this.$refs.allnevi.focus()
        clearInterval(ivsi)
      }, 100 )
    },
    ment() {
      if (this.form._id) {
        this.axios
            .post('http://localhost:3000/modify',this.form)
            .then(resp => {
              if (resp.data.n) {
                this.view  = 'list'
              } else {
                this.hiba = true
                let iv = setInterval( () => {
                  this.hiba = false
                  clearInterval(iv)
                }, 1500 )
              }
            })
      } else {
        this.keres = this.form.allatnev
        this.axios
            .post('http://localhost:3000/',this.form)
            .then(resp => {
              if (resp.data._id) {
                this.form._id = resp.data._id
                this.tbody_origin.push(this.form)
                this.view  = 'list'
              } else {
                this.hiba = true
                let iv = setInterval( () => {
                  this.hiba = false
                  clearInterval(iv)
                }, 1500 )
              }
            })
      }
    },
    ujallat() {
      this.form = {
            szule: new Date().getYear()+1900,
            veszolip: new Date()
                    .toLocaleDateString('hu-HU')
                    .split('.')
                    .map( v=>v.trim() )
                    .slice(0,3)
                    .join('-')
      }
      this.form.allatnev=this.keres
      this.view='uja'
      let ivsi = setInterval( () => {
        this.$refs.tulnevi.focus()
        clearInterval(ivsi)
      }, 100 )

    },
    keresenter() {
      if (this.tbody.length === 0) this.ujallat()
      else if (this.tbody.length === 1) this.edit(this.tbody[0]._id)
    },
    edit(x) {
      if ( this.tbody_origin.find( v => v._id == x) ) {
        this.form = this.tbody_origin.find( v => v._id == x)
        this.view='uja'
      }
    },
    del(x) {
      this.axios
          .post('http://localhost:3000/del',{id: x})
          .then( resp => {
            if (resp.data.ok) {
              this.tbody_origin =
              this.tbody_origin.map( v => (v._id == x) ? (v._id = '', v) : v )
              this.tbody_origin.sort( (a,b) => b._id.localeCompare(a._id) )
              this.tbody_origin.pop()
              this.tbody_origin.sort( (a,b) => a.tulajnev.localeCompare(b.tulajnev) )
              this.keres=''
            } else {
              this.hiba = true
              let iv = setInterval( () => {
                this.hiba = false
                clearInterval(iv)
              }, 1500 )
            }
          } )
    }
  },
  computed: {
    flist() {
      let fajtaset = new Set()
      this.tbody_origin.forEach( v=>
        fajtaset.add(v.fajta)
      )
      let fajtalist = []
      fajtaset.forEach( v => fajtalist.push(v) )
      fajtalist.sort( (a,b) => a.localeCompare(b) )
      return fajtalist
    },
    tbody() {
      let kt = new RegExp(this.keres,'i')
      return this
              .tbody_origin
              .filter( v =>
                  kt.test(v.allatnev)  ||  kt.test(v.tulajnev)  ||  kt.test(v.fajta)
              )
              .slice(0,10)
    }
  },
  mounted() {
    this.axios
        .get('http://localhost:3000/')
        .then( resp => this.tbody_origin = resp.data.sort(
          (a, b) => a.tulajnev.localeCompare(b.tulajnev)
        ) )
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=BioRhyme+Expanded');
#body {
  margin:20px;
}
.cim {
  font-family: 'BioRhyme Expanded', serif;
  font-size: 30px;
  text-shadow: 1px 1px 4px;
}
.kerek {
  margin:6px;
  padding:13px;
  background-color: #000;
  color:white;
  box-shadow: 1px 1px 5px #000;
  border-radius: 10px;
}
.red {
  color:#cf3443;
  background-color: #daeeec;
  font-weight: bolder;
  margin: 20px;
  padding: 10px;
  box-shadow: 1px 1px 5px #000;
  border-radius: 10px;
}
</style>
