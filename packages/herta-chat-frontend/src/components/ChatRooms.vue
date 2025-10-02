<script setup lang="ts">
import { useMainStore } from '@/stores/main'
import { watchEffect } from 'vue'
import { ref } from 'vue'

const store = useMainStore()
const renameRoomID = ref('')
const roomName = ref('')

const showDialog = ref(false)
watchEffect(() => {
  showDialog.value = renameRoomID.value !== ''
})
const renameRoom = () => {
  store.chatRooms = store.chatRooms.map((room) => {
    if (room.uuid === renameRoomID.value) {
      room.name = roomName.value
    }
    return room
  })
  renameRoomID.value = ''
}
</script>

<template>
  <div class="container-rooms">
    <div id="new">
      <var-button block @click="store.createRoom">创建新房间</var-button>
    </div>
    <div id="rooms">
      <var-cell
        class="room"
        v-for="room in store.chatRooms.sort((a, b) => b.modify - a.modify)"
        border
        @click="store.currentRoomID = room.uuid"
      >
        <span>{{ room.name }}</span>
        <var-button text size="small" @click="((renameRoomID = room.uuid), (roomName = room.name))"
          >重命名</var-button
        >
        <var-button
          text
          round
          @click="
            ((store.chatRooms = store.chatRooms.filter((_room) => _room.uuid !== room.uuid)),
            (store.currentRoomID = ''))
          "
        >
          <var-icon name="delete" />
        </var-button>
      </var-cell>
    </div>
    <var-dialog v-model:show="showDialog" @confirm="renameRoom">
      <template #title>重命名房间</template>
      <var-input v-model="roomName" placeholder="请输入房间名称" />
    </var-dialog>
  </div>
</template>

<style lang="css" scoped>
.container-rooms {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
}
#new {
  padding: 5px;
  flex-shrink: 0;
}
#rooms {
  flex-grow: 1;
  overflow-y: auto;
}
.room {
  cursor: pointer;
}
</style>
